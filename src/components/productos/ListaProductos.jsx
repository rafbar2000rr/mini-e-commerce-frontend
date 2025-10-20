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

  // 🔹 Aquí debes tener el token del admin (guardado en localStorage o context)
  const token = localStorage.getItem("token"); // ejemplo: lo guardaste al hacer login

  const fetchProductos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/productos`, {
        params: { page, limit: 5, search },
        headers: {
          Authorization: `Bearer ${token}`, // ✅ incluimos token para pasar el middleware
        },
      });
      setProductos(res.data.productos);
      setPages(res.data.pages);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, [page, search, token]);

  useEffect(() => {
    fetchProductos();
  }, [refrescar, fetchProductos]);

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await axios.delete(`${API_URL}/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const actualizarStock = async (id, cantidad) => {
    try {
      await axios.patch(`${API_URL}/productos/${id}/stock`, { cantidad }, {
        headers: { Authorization: `Bearer ${token}` },
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
      {/* ... resto del componente igual ... */}
    </div>
  );
}
