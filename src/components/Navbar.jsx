import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { carrito } = useCarrito();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) setUsuario(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex justify-between items-center">
      {/* Logo o nombre del sitio */}
      <Link to="/catalogo" className="text-xl font-bold text-gray-700">
        🛍️ Mini E-Commerce
      </Link>

      <div className="flex items-center gap-4">
        {/* Catálogo */}
        <Link to="/catalogo" className="text-gray-600 hover:text-black">
          Catálogo
        </Link>

        {/* Carrito */}
        <Link to="/carrito" className="text-gray-600 hover:text-black">
          Carrito ({carrito.length})
        </Link>

        {/* Si el usuario está logueado */}
        {usuario ? (
          <>
            <span className="text-gray-700 font-medium">
              👋 Hola, {usuario.nombre}
            </span>
            {token && (
  <Link
    to="/mi-perfil"
    className="text-sm font-medium hover:text-yellow-300 transition-colors"
  >
    Mi Perfil
  </Link>
)}
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
