// src/admin/ListaPedidos.jsx
import { useEffect, useState } from "react";

function ListaPedidos() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState(""); // 🔎 Nuevo estado de búsqueda

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const res = await fetch("http://localhost:5000/orders");
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
      const res = await fetch(`http://localhost:5000/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      fetchOrdenes();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  if (loading) return <p>Cargando órdenes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

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

  // ✅ Filtrado en tiempo real
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

      {/* 🔎 Input de búsqueda */}
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
          border="1"
          cellPadding="10"
          style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Email</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map((orden) => (
              <tr key={orden._id}>
                <td>{orden._id}</td>
                <td>{orden.datosCliente?.nombre || orden.usuario?.nombre || "Sin cliente"}</td>
                <td>{orden.datosCliente?.email || orden.usuario?.email || "-"}</td>
                <td>
                  <ul>
                    {orden.productos.map((p, i) => (
                      <li key={i}>
                        {p.nombre} (x{p.cantidad}) — ${p.precio}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>${orden.total}</td>
                <td>{new Date(orden.fecha).toLocaleDateString()}</td>
                <td style={getEstadoColor(orden.estado)}>
                  <select
                    value={orden.estado}
                    onChange={(e) => cambiarEstado(orden._id, e.target.value)}
                    style={{
                      padding: "5px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                  </select>
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
