import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";

//--------------------------------
//Muestra el detalle del producto
//--------------------------------
function DetalleProducto() {
  // ✅ obtenemos el "id" del producto desde la URL (ej: /productos/123)
  const { id } = useParams();

  // ✅ usamos la función del contexto que permite agregar al carrito
  const { agregarAlCarrito } = useContext(CarritoContext);

  // ✅ estados para manejar el producto, la carga y los errores
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ useEffect para cargar el producto cuando cambia el "id"
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        // hacemos la petición al backend para obtener el producto por su id
        const res = await fetch(`http://localhost:5000/productos/${id}`);
        if (!res.ok) throw new Error("Error al cargar el producto");

        // convertimos la respuesta en JSON
        const data = await res.json();

        // guardamos el producto en el estado
        setProducto(data);
      } catch (err) {
        // si ocurre un error lo guardamos en el estado
        setError(err.message);
      } finally {
        // dejamos de mostrar el estado de carga
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  // ✅ condiciones de renderizado
  if (loading) return <p>Cargando producto...</p>; // mientras carga
  if (error) return <p>{error}</p>; // si hubo error
  if (!producto) return <p>Producto no encontrado</p>; // si no existe el producto

  // ✅ función para añadir el producto al carrito
  const handleAgregar = () => {
    // normalizamos el producto por si viene con `id` en vez de `_id`
    const productoNormalizado = {
      ...producto,
      _id: producto._id || producto.id,
    };

    agregarAlCarrito(productoNormalizado);
    alert("Producto añadido al carrito 🛒✨");
  };

  // ✅ construir la URL de la imagen del producto
  const imagenUrl = Array.isArray(producto.imagen)
    ? `http://localhost:5000/uploads/${producto.imagen[0]}` // si es un array, tomamos la primera
    : `http://localhost:5000/uploads/${producto.imagen}`;   // si es string, lo usamos directamente

  // ✅ renderizado del detalle del producto
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-8 bg-gray-50 min-h-screen">
      {/* Imagen del producto */}
      <div className="flex-shrink-0">
        <img
          src={imagenUrl}
          alt={producto.nombre}
          className="w-80 h-80 object-cover rounded-xl shadow-md border"
        />
      </div>

      {/* Información del producto */}
      <div className="flex-1 bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">{producto.nombre}</h2>
        <p className="text-gray-600 mb-4">{producto.descripcion}</p>
        <h3 className="text-2xl font-semibold text-green-600 mb-6">${producto.precio}</h3>

        {/* Botón para añadir al carrito */}
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
