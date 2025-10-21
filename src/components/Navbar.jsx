import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";

export default function Navbar() {
  const { carrito } = useCarrito();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  // ✅ URL de producción, ya incluye /api
  const API_URL = import.meta.env.VITE_API_URL || "";

  // 🔹 Obtener usuario logueado
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token || !API_URL) return;

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        setUsuario(data);
      } catch (err) {
        console.error("Error al obtener usuario:", err);
        localStorage.removeItem("token");
        setUsuario(null);
      }
    };

    fetchUser();
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link to="/catalogo" className="text-xl font-bold text-gray-700 flex items-center gap-2">
        🛍️ Mini E-Commerce
      </Link>

      {/* Menú */}
      <div className="flex items-center gap-4">
        {/* Catálogo */}
        <Link to="/catalogo" className="text-gray-600 hover:text-black flex items-center gap-1">
          Catálogo
        </Link>

        {/* Carrito */}
        <Link to="/carrito" className="text-gray-600 hover:text-black flex items-center gap-1">
          <FaShoppingCart /> Carrito ({carrito.length})
        </Link>

        {/* Usuario */}
        {usuario ? (
          <>
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <FaUser /> Hola, {usuario.nombre?.split(" ")[0] || "Usuario"}
            </span>
            <Link to="/mi-perfil" className="text-gray-600 hover:text-black flex items-center gap-1">
              Mi perfil
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-black">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="text-gray-600 hover:text-black">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
