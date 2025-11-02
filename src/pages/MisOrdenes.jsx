import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

//-------------------------------------------------
// 🛍️ Lista de órdenes del usuario (diseño moderno)
//-------------------------------------------------
export default function MisOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  // 🖼️ Imagen del producto
  const getImagen = (imagen) => {
    if (!imagen) return "/placeholder.png";
    return imagen.startsWith("http") ? imagen : `${API_URL}/uploads/${imagen}`;
  };

  // 📦 Cargar órdenes
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/my-orders`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          setError("Tu sesión ha expirado. Inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Error al obtener tus órdenes");
        const data = await res.json();

        if (data.error) setError(data.error);
        else {
          const ordenadas = [...data].sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );
          setOrdenes(ordenadas);
        }
      } catch (err) {
        setError(err.message || "Error al obtener tus órdenes");
      } finally {
        setLoading(false);
      }
    })();
  }, [location]);

  // 🎨 Colores según estado
  const getEstadoColor = (estado) => {
    const estilos = {
      pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
      enviado: "bg-blue-100 text-blue-700 border-blue-300",
      entregado: "bg-green-100 text-green-700 border-green-300",
    };
    return estilos[estado] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getPayPalColor = (status) => {
    const estilos = {
      COMPLETED: "bg-green-100 text-green-700 border-green-300",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      CANCELLED: "bg-red-100 text-red-700 border-red-300",
      DENIED: "bg-red-100 text-red-700 border-red-300",
    };
    return estilos[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (loading)
    return (
      <p className="p-8 text-gray-600 animate-pulse">Cargando tus órdenes...</p>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Mis Órdenes
      </h2>

      {error && (
        <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
          {error}
        </p>
      )}

      {ordenes.length === 0 ? (
        <p className="text-gray-600 text-center">
          No has realizado ninguna compra aún.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordenes.map((o) => {
            const p = o.productos?.[0];
            return (
              <Link
                key={o._id}
                to={`/mis-ordenes/${o._id}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
              >
                {/* Imagen */}
                <div className="relative">
                  <img
                    src={getImagen(p?.imagen)}
                    alt={p?.nombre || "Producto"}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full border ${getEstadoColor(
                      o.estado
                    )}`}
                  >
                    {o.estado?.charAt(0).toUpperCase() + o.estado?.slice(1)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                    {p?.nombre || "Producto sin nombre"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Fecha:{" "}
                    <span className="font-medium">
                      {new Date(o.fecha).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {o.productos?.length ?? 0} producto(s)
                  </p>
                  <p className="text-gray-800 font-bold text-lg mb-3">
                    {o.total?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getPayPalColor(
                      o.status
                    )}`}
                  >
                    {o.status || "Sin estado PayPal"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
