import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";

function DetalleProducto() {
  const { id } = useParams();
  const { agregarAlCarrito } = useContext(CarritoContext);
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // 🔹 Cargar producto (sin importar si hay usuario o no)
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos/${id}`);
        if (!res.ok) throw new Error("Error al cargar el producto");
        const data = await res.json();
        setProducto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  if (loading) return <p className="p-8 text-gray-600">Cargando producto...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;
  if (!producto) return <p className="p-8 text-gray-600">Producto no encontrado</p>;

  // 🔹 Agregar producto al carrito
  const handleAgregar = () => {
    const productoNormalizado = { ...producto, _id: producto._id || producto.id };
    agregarAlCarrito(productoNormalizado);
    alert("Producto añadido al carrito 🛒✨");
    navigate("/catalogo"); // 👉 Volver al catálogo
  };

  const getImagenUrl = (imagen) => {
    if (!imagen) return "https://via.placeholder.com/320";
    if (imagen.startsWith("http")) return imagen;
    if (Array.isArray(imagen)) return `${API_URL}/uploads/${imagen[0]}`;
    return `${API_URL}/uploads/${imagen}`;
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-8 bg-gray-50 min-h-screen">
      <div className="flex-shrink-0">
        <img
          src={getImagenUrl(producto.imagen)}
          alt={producto.nombre}
          className="w-80 h-80 object-cover rounded-xl shadow-md border"
        />
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">{producto.nombre}</h2>
        <p className="text-gray-600 mb-4">{producto.descripcion}</p>
        <h3 className="text-2xl font-semibold text-green-600 mb-6">
          ${producto.precio}
        </h3>

        <button
          onClick={handleAgregar}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition"
        >
          Agregar al carrito 🛒
        </button>
      </div>
    </div>
  );
}

export default DetalleProducto;
