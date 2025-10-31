import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

//-------------------------------------------------
// 🧾 Lista de órdenes del usuario (con imágenes y estados)
//-------------------------------------------------
export default function MisOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  // 🖼️ URL correcta de imagen
  const getImagen = (imagen) => {
    if (!imagen) return "/placeholder.png"; // placeholder si no hay imagen
    return imagen.startsWith("http") ? imagen : `${API_URL}/uploads/${imagen}`;
  };

  // 🎯 Cargar órdenes
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
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

        if (data.error) {
          setError(data.error);
        } else {
          // ✅ Ordenar por fecha descendente
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

  if (loading) return <p className="p-8 text-gray-600">Cargando tus órdenes...</p>;

  // 🎨 Colores para estado interno
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "enviado":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "entregado":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // 🎨 Colores para estado PayPal
  const getPayPalColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "CANCELLED":
      case "DENIED":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Mis Órdenes</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {ordenes.length === 0 ? (
        <p className="text-gray-600">No has realizado ninguna compra aún.</p>
      ) : (
        <ul className="space-y-4">
          {ordenes.map((o, i) => {
            const primerProducto = o.productos?.[0];

            return (
              <li key={o._id ?? i}>
                <Link
                  to={`/mis-ordenes/${o._id ?? ""}`}
                  className="flex items-center gap-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-gray-200"
                >
                  {/* 🖼️ Imagen */}
                  {primerProducto?.imagen ? (
                    <img
                      src={getImagen(primerProducto.imagen)}
                      alt={primerProducto.nombre}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg">
                      📦
                    </div>
                  )}

                  {/* 📋 Info */}
                  <div className="flex-1">
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Fecha:</span>{" "}
                      {o.fecha ? new Date(o.fecha).toLocaleString() : "No disponible"}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Total:</span>{" "}
                      {o.total?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      }) ?? "$0.00"}
                    </p>

                    {/* 💌 Estado interno */}
                    <span
                      className={`inline-block mt-1 mr-2 px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(
                        o.estado
                      )}`}
                    >
                      {o.estado?.charAt(0).toUpperCase() + o.estado?.slice(1)}
                    </span>

                    {/* 💰 Estado PayPal */}
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium border ${getPayPalColor(
                        o.status
                      )}`}
                    >
                      {o.status || "Sin estado PayPal"}
                    </span>

                    <p className="text-gray-500 text-sm mt-1">
                      {o.productos?.length ?? 0} producto(s) — Haz clic para ver detalles
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
