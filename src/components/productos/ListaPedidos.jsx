import { useEffect, useState } from "react";

function ListaPedidos({ usuario: usuarioProp }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [usuario, setUsuario] = useState(usuarioProp || null);
  const API_URL = import.meta.env.VITE_API_URL;

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
        return "bg-yellow-100 text-yellow-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Órdenes</h2>
      <input
        type="text"
        placeholder="Buscar por cliente, email o estado..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 p-2 w-full max-w-md border rounded-lg"
      />

      {ordenesFiltradas.length === 0 ? (
        <p>No hay órdenes registradas</p>
      ) : (
        <>
          {/* 💻 Tabla en pantallas grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Cliente</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Productos</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map((orden) => (
                  <tr key={orden._id} className="border-t">
                    <td className="p-3">{orden._id}</td>
                    <td className="p-3">
                      {orden.datosCliente?.nombre || orden.usuario?.nombre || "Sin cliente"}
                    </td>
                    <td className="p-3">
                      {orden.datosCliente?.email || orden.usuario?.email || "-"}
                    </td>
                    <td className="p-3">
                      <ul>
                        {orden.productos.map((p, i) => (
                          <li key={i}>
                            {p.nombre} (x{p.cantidad}) — ${p.precio}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3">${orden.total}</td>
                    <td className="p-3">
                      {new Date(orden.fecha).toLocaleDateString()}
                    </td>
                    <td className={`p-3 ${getEstadoColor(orden.estado)}`}>
                      {usuario?.rol === "admin" ? (
                        <select
                          value={orden.estado}
                          onChange={(e) => cambiarEstado(orden._id, e.target.value)}
                          className="p-1 rounded border border-gray-300"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                        </select>
                      ) : (
                        <span>{orden.estado}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📱 Tarjetas en móvil */}
          <div className="block md:hidden space-y-4">
            {ordenesFiltradas.map((orden) => (
              <div
                key={orden._id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">ID:</span> {orden._id}
                </p>
                <p>
                  <span className="font-semibold">Cliente:</span>{" "}
                  {orden.datosCliente?.nombre || orden.usuario?.nombre || "Sin cliente"}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {orden.datosCliente?.email || orden.usuario?.email || "-"}
                </p>
                <p>
                  <span className="font-semibold">Productos:</span>
                </p>
                <ul className="ml-4 text-sm text-gray-700">
                  {orden.productos.map((p, i) => (
                    <li key={i}>
                      {p.nombre} (x{p.cantidad}) — ${p.precio}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">
                  <span className="font-semibold">Total:</span> ${orden.total}
                </p>
                <p>
                  <span className="font-semibold">Fecha:</span>{" "}
                  {new Date(orden.fecha).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-medium ${getEstadoColor(
                      orden.estado
                    )}`}
                  >
                    {orden.estado}
                  </span>
                </div>

                {/* 🩷 Botones uno debajo del otro */}
                {usuario?.rol === "admin" && (
                  <div className="mt-3 flex flex-col gap-2">
                    <select
                      value={orden.estado}
                      onChange={(e) => cambiarEstado(orden._id, e.target.value)}
                      className="p-2 rounded border border-gray-300 bg-gray-50 text-sm"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ListaPedidos;
