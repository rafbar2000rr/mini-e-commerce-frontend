import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function OrdenDetalle() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No estás autenticada');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Error al obtener la orden');

        const data = await res.json();
        console.log("📦 Respuesta de /orders/:id:", data);

        if (data.error) {
          setError(data.error);
        } else {
          setOrden(data);
        }
      } catch (err) {
        setError(err.message || 'Error al obtener detalles de la orden');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const descargarPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No estás autenticada');
        return;
      }

      const res = await fetch(`${API_URL}/orders/${orden._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('No se pudo generar el PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden_${orden._id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Error al descargar el PDF');
    }
  };

  if (loading) return <p className="p-8 text-gray-600">Cargando...</p>;
  if (error) return <p className="text-red-500 p-8">{error}</p>;
  if (!orden) return <p className="p-8 text-gray-600">Orden no encontrada</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🛒 Detalle de la Orden</h2>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        {/* Datos básicos de la orden */}
        <p className="mb-2"><span className="font-semibold">ID:</span> {orden._id}</p>
        <p className="mb-2"><span className="font-semibold">Fecha:</span> {new Date(orden.fecha).toLocaleString()}</p>
        <p className="mb-2"><span className="font-semibold">Estado:</span> {orden.estado ?? 'Pendiente'}</p>
        <p className="mb-4">
          <span className="font-semibold">Total:</span>{' '}
          {orden.total?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </p>

        {/* Datos del cliente */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Datos del Cliente:</h3>
          <p className="mb-1"><span className="font-semibold">Nombre:</span> {orden.datosCliente?.nombre}</p>
          <p className="mb-1"><span className="font-semibold">Email:</span> {orden.datosCliente?.email}</p>
          <p><span className="font-semibold">Envío:</span> {orden.datosCliente?.direccion}, {orden.datosCliente?.ciudad}, {orden.datosCliente?.codigoPostal}</p>
        </div>

        {/* Lista de productos */}
        <h3 className="font-semibold text-gray-700 mb-3">Productos:</h3>
        <div className="space-y-4 mb-6">
          {orden.productos?.map((p, i) => (
  <div key={i} className="flex items-center gap-4 border-b pb-3">
    <img
      src={p.productoId?.imagen
        ? `${API_URL}/uploads/${p.productoId.imagen}`
        : 'https://via.placeholder.com/80'}
      alt={p.productoId?.nombre}
      className="w-20 h-20 object-cover rounded"
    />
    <div>
      <p className="font-medium text-gray-800">{p.productoId?.nombre}</p>
      <p className="text-gray-600">
        {(p.productoId?.precio ?? p.precio)?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })} x {p.cantidad ?? 1}
      </p>
    </div>
  </div>
))}

        </div>

        {/* Botón descargar PDF */}
        <button
          onClick={descargarPDF}
          className="mt-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Descargar PDF 🧾
        </button>
      </div>
    </div>
  );
}
