import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function ListaProductos({ refrescar, onEditar }) {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const API_URL = import.meta.env.VITE_API_URL;
  const fetchProductos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/productos`, {
        params: { page, limit: 5, search },
      });
      setProductos(res.data.productos);
      setPages(res.data.pages);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProductos();
  }, [refrescar, fetchProductos]);

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await axios.delete(`${API_URL}/productos/${id}`);
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const actualizarStock = async (id, cantidad) => {
    try {
      await axios.patch(`${API_URL}/productos/${id}/stock`, {
        cantidad,
      });
      fetchProductos();
    } catch (error) {
      console.error("Error al actualizar stock:", error);
    }
  };

  const getStockColor = (stock) => {
    if (stock <= 5) return "text-red-600";
    if (stock <= 20) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Lista de Productos</h2>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
              <th className="p-3 border-b">Imagen</th>
              <th className="p-3 border-b">Nombre</th>
              <th className="p-3 border-b">Precio</th>
              <th className="p-3 border-b">Stock</th>
              <th className="p-3 border-b">Descripción</th>
              <th className="p-3 border-b">Categoría</th>
              <th className="p-3 border-b">Acciones</th>
            </tr>
          </thead>

          <AnimatePresence component="tbody">
            {productos.map((producto) => (
              <motion.tr
                key={producto._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-gray-50"
              >
                <td className="p-3 border-b">
                  {producto.imagen && (
                    <img
                      src={`${API_URL}/uploads/${producto.imagen}`}
                      alt={producto.nombre}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  )}
                </td>

                <td className="p-3 border-b">
                  <Link
                    to={`/producto/${producto._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {producto.nombre}
                  </Link>
                </td>

                <td className="p-3 border-b font-semibold text-green-600">
                  ${producto.precio}
                </td>

                {/* 🔹 STOCK */}
                <td className="p-3 border-b">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => actualizarStock(producto._id, -1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className={`font-semibold ${getStockColor(producto.stock ?? 0)}`}>
                      {producto.stock ?? 0}
                    </span>
                    <button
                      onClick={() => actualizarStock(producto._id, 1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </td>

                <td className="p-3 border-b">{producto.descripcion}</td>
                <td className="p-3 border-b">
                  {(() => {
                    if (!producto.categoria) return "Sin categoría";
                    if (typeof producto.categoria === "string") return producto.categoria;
                    if (typeof producto.categoria === "object")
                      return producto.categoria.nombre || "Sin nombre";
                    return "Sin categoría";
                  })()}
                </td>

                <td className="p-3 border-b space-x-2">
                  <button
                    onClick={() => onEditar(producto)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg shadow"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow"
                  >
                    Eliminar
                  </button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </table>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: pages }, (_, i) => (
          <motion.button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              page === i + 1
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {i + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
