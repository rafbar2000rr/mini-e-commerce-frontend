import { useEffect, useState } from "react";

function ListaPedidos({ usuario: usuarioProp }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [usuario, setUsuario] = useState(usuarioProp || null);
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Obtener usuario del localStorage si no viene por props
  useEffect(() => {
    if (!usuarioProp) {
      const userData = localStorage.getItem("usuario");
      if (userData) setUsuario(JSON.parse(userData));
    }
  }, [usuarioProp]);

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener órdenes");
      const data = await res.json();
      setOrdenes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const confirmar = window.confirm(
      `¿Seguro que quieres cambiar el estado a "${nuevoEstado}"?`
    );
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("No tienes permiso para actualizar el estado");
      fetchOrdenes();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  if (loading) return <p>Cargando órdenes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!usuario) return <p>Cargando usuario...</p>;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return { background: "#fff3cd", color: "#856404" };
      case "enviado":
        return { background: "#cce5ff", color: "#004085" };
      case "entregado":
        return { background: "#d4edda", color: "#155724" };
      default:
        return {};
    }
  };

  const ordenesFiltradas = ordenes.filter((orden) => {
    const texto = busqueda.toLowerCase();
    return (
      orden.datosCliente?.nombre?.toLowerCase().includes(texto) ||
      orden.datosCliente?.email?.toLowerCase().includes(texto) ||
      orden.estado?.toLowerCase().includes(texto)
    );
  });

  return (
    <div>
      <h2>Lista de Órdenes</h2>
      <input
        type="text"
        placeholder="Buscar por cliente, email o estado..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          marginBottom: "15px",
          padding: "8px",
          width: "300px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      {ordenesFiltradas.length === 0 ? (
        <p>No hay órdenes registradas</p>
      ) : (
        <table
  className="w-full border-collapse text-left"
>
  <thead>
    <tr className="bg-gray-100 text-gray-700">
      <th className="p-2 border">ID</th>
      <th className="p-2 border">Cliente</th>
      <th className="p-2 border">Email</th>
      <th className="p-2 border">Productos</th>
      <th className="p-2 border">Total</th>
      <th className="p-2 border">Fecha</th>
      <th className="p-2 border">Estado</th>
      <th className="p-2 border text-center">Acciones</th>
    </tr>
  </thead>

  <tbody>
    {ordenesFiltradas.map((orden) => (
      <tr key={orden._id} className="border-b hover:bg-gray-50">
        <td className="p-2">{orden._id}</td>
        <td className="p-2">{orden.datosCliente?.nombre || orden.usuario?.nombre || "Sin cliente"}</td>
        <td className="p-2">{orden.datosCliente?.email || orden.usuario?.email || "-"}</td>
        <td className="p-2">
          <ul>
            {orden.productos.map((p, i) => (
              <li key={i}>
                {p.nombre} (x{p.cantidad}) — ${p.precio}
              </li>
            ))}
          </ul>
        </td>
        <td className="p-2">${orden.total}</td>
        <td className="p-2">{new Date(orden.fecha).toLocaleDateString()}</td>
        <td className="p-2" style={getEstadoColor(orden.estado)}>
          {usuario?.rol === "admin" ? (
            <select
              value={orden.estado}
              onChange={(e) => cambiarEstado(orden._id, e.target.value)}
              className="p-1 border rounded cursor-pointer bg-white"
            >
              <option value="pendiente">Pendiente</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
            </select>
          ) : (
            <span>{orden.estado}</span>
          )}
        </td>

        {/* 🔹 Columna de acciones responsiva */}
        <td className="p-2">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded w-full sm:w-auto"
              onClick={() => alert(`Editar orden ${orden._id}`)}
            >
              Editar
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded w-full sm:w-auto"
              onClick={() => alert(`Eliminar orden ${orden._id}`)}
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      )}
    </div>
  );
}

export default ListaPedidos;
