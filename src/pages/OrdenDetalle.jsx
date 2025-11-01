import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

//-------------------------------------------------
// Muestra el detalle completo de una orden
//-------------------------------------------------
export default function OrdenDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  //-----------------------------------------------
  // useEffect → trae los datos de la orden al montar
  //-----------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No estás autenticada');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          setError('Tu sesión ha expirado. Inicia sesión nuevamente.');
          setLoading(false);
          return;
        }

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

  //-----------------------------------------------
  // Función para descargar la orden en PDF
  //-----------------------------------------------
  const descargarPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticada");
        return;
      }

      const res = await fetch(`${API_URL}/api/orders/${orden._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo generar el PDF");

      const blob = await res.blob();
      if (!blob || blob.size === 0) throw new Error("PDF vacío");

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orden_${orden._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Error al descargar el PDF");
    }
  };

  //-----------------------------------------------
  // Mostrar estados de carga, error o inexistencia
  //-----------------------------------------------
  if (loading) return <p className="p-8 text-gray-600">Cargando...</p>;
  if (error) return <p className="text-red-500 p-8">{error}</p>;
  if (!orden) return <p className="p-8 text-gray-600">Orden no encontrada</p>;

  //-----------------------------------------------
  // ✅ Función para obtener imagen (snapshot o ref)
  //-----------------------------------------------
  const getImagen = (producto) => {
    const imagen = producto?.productoId?.imagen || producto?.imagen;
    if (!imagen) return 'https://via.placeholder.com/80';
    return imagen.startsWith('http') ? imagen : `${API_URL}/uploads/${imagen}`;
  };

  //-----------------------------------------------
  // ✅ Obtener fecha formateada correctamente
  //-----------------------------------------------
  const fechaOrden = new Date(
    orden.datosCliente?.fecha ?? orden.createdAt
  ).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Detalle de la Orden
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        {/* 🔹 Datos básicos de la orden */}
        <p className="mb-2"><span className="font-semibold">ID:</span> {orden._id}</p>
        <p className="mb-2"><span className="font-semibold">Fecha:</span> {fechaOrden}</p>
        <p className="mb-2"><span className="font-semibold">Estado:</span> {orden.estado ?? 'Pendiente'}</p>
        <p className="mb-4">
          <span className="font-semibold">Total:</span>{' '}
          {orden.total?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </p>

        {/* 🔹 Datos del cliente */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Datos del Cliente:</h3>
          <p className="mb-1"><span className="font-semibold">Nombre:</span> {orden.datosCliente?.nombre}</p>
          <p className="mb-1"><span className="font-semibold">Email:</span> {orden.datosCliente?.email}</p>
          <p>
            <span className="font-semibold">Envío:</span>{' '}
            {orden.datosCliente?.direccion}, {orden.datosCliente?.ciudad}, {orden.datosCliente?.codigoPostal}
          </p>
        </div>

        {/* 🔹 Lista de productos */}
        <h3 className="font-semibold text-gray-700 mb-3">Productos:</h3>
        <div className="space-y-4 mb-6">
          {orden.productos?.map((p, i) => {
            const precioUnitario = p.precioPagado ?? p.precio ?? p.productoId?.precio ?? 0;
            const subtotal = precioUnitario * (p.cantidad ?? 1);
            return (
              <div key={i} className="flex items-center gap-4 border-b pb-3">
                <img
                  src={getImagen(p)}
                  alt={p.productoId?.nombre || p.nombre || 'Producto eliminado'}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {p.productoId?.nombre || p.nombre || 'Producto eliminado'}
                  </p>
                  <p className="text-gray-600">
                    {precioUnitario.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}{" "}
                    × {p.cantidad ?? 1}
                  </p>
                </div>
                <p className="font-semibold text-gray-800">
                  {subtotal.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>
            );
          })}
        </div>

        {/* 🔹 Total */}
        <hr className="my-4" />
        <p className="text-right text-lg font-bold">
          Total:{' '}
          {orden.total?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>

        {/* 🔹 Botones */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate('/mis-ordenes')}
            className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
          >
            ← Volver a mis órdenes
          </button>

          <button
            onClick={descargarPDF}
            className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
