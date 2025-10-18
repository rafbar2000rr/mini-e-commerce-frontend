import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // 👈 agregado useLocation

//-------------------------------------------------
//Genera la lista de todas las órdenes del usuario
//-------------------------------------------------
export default function MisOrdenes() {
  // ✅ Lista de órdenes del usuario
  const [ordenes, setOrdenes] = useState([]);

  // ✅ Posibles errores en la carga
  const [error, setError] = useState('');

  // ✅ Estado de carga
  const [loading, setLoading] = useState(true);

  // ✅ Detectar cambios en la ruta (para refrescar automáticamente)
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;
  // ✅ useEffect → se ejecuta al montar para traer órdenes del usuario
  useEffect(() => {
  (async () => {
    try {
      // 🔹 obtenemos el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
        setLoading(false);
        return;
      }

      // 🔹 pedimos órdenes al backend
      const res = await fetch('${API_URL}/my-orders', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("🧠 Token enviado:", token);

      if (res.status === 401) {
        setError('Tu sesión ha expirado. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Error al obtener tus órdenes');
      }
      console.log("📡 Respuesta HTTP:", res.status);

      const data = await res.json();
      console.log("📦 Datos recibidos:", data);

      if (data.error) {
        setError(data.error);
      } else {
        // ✅ Ordenar órdenes por fecha descendente
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrdenes(ordenadas);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener tus órdenes');
    } finally {
      setLoading(false);
    }
  })();
}, []);

  if (loading) {
    return <p className="p-8 text-gray-600">Cargando tus órdenes...</p>;
  }
  console.log("✅ MisOrdenes montado");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🧾 Mis Órdenes</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {ordenes.length === 0 ? (
        <p className="text-gray-600">No has realizado ninguna compra aún.</p>
      ) : (
        <ul className="space-y-4">
          {ordenes.map((o, i) => {
            // ✅ Tomamos el primer producto → pero usando productoId (populado desde el backend)
            const primerProducto = o.productos?.[0]?.productoId;

            return (
              <li key={o._id ?? i}>
                <Link
                  to={`/mis-ordenes/${o._id ?? ''}`}
                  className="flex items-center gap-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-gray-200"
                >
                  {/* ✅ Miniatura usando productoId.imagen */}
                  {primerProducto?.imagen ? (
                    <img
                      src={`${API_URL}/uploads/${primerProducto.imagen}`}
                      alt={primerProducto.nombre}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg">
                      📦
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Fecha:</span>{' '}
                      {o.fecha
                        ? new Date(o.fecha).toLocaleString()
                        : 'No disponible'}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Total:</span>{' '}
                      {o.total?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }) ?? '$0.00'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {o.productos?.length ?? 0} producto(s) — Haz clic para ver
                      detalles
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
