import { useContext, useState, useRef, useEffect } from "react";
import { CarritoContext } from "../context/CarritoContext";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { carrito, setCarrito, setUsuario } = useContext(CarritoContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCarrito([]);
    localStorage.removeItem("carrito");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-violet-600 hover:bg-violet-500 transition-colors shadow-md">
  <nav className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center text-white">
    {/* Logo → inicio */}
    <div className="navbar-left">
      <Link 
        to="/" 
        className="text-xl font-semibold hover:text-white/80 transition-colors"
      >
        Mini E-Commerce
      </Link>
    </div>

    {/* Navegación derecha */}
    <div className="navbar-right flex items-center gap-4">
      {!token ? (
        <Link 
          to="/login" 
          className="text-sm font-medium hover:text-white/80 transition-colors"
        >
          Login
        </Link>
      ) : (
        <div className="relative group">
          <button className="text-sm font-medium hover:text-white/80 transition-colors">
            Menú
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
            <Link to="/perfil" className="block px-4 py-2 hover:bg-gray-100">Mi Perfil</Link>
            <Link to="/mis-ordenes" className="block px-4 py-2 hover:bg-gray-100">Mis Órdenes</Link>
            <button 
              onClick={handleLogout} 
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Carrito */}
      <Link 
        to="/carrito" 
        className="relative flex items-center bg-white text-violet-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-violet-50 transition-colors"
      >
        <FaShoppingCart size={18} />
        {carrito.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {carrito.length}
          </span>
        )}
      </Link>
    </div>
  </nav>
</header>

  );
}
