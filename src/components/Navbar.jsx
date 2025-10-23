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
    <header className="sticky top-0 z-50 bg-[#6D28D9] shadow-md"> {/* ← violeta exacto #6D28D9 */}
      <nav className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center text-white">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-semibold hover:text-[#C7B3FF] transition-colors"
        >
          Mini E-Commerce
        </Link>

        <div className="flex items-center gap-5">
          {/* Icono Usuario */}
          {token && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="focus:outline-none"
              >
                <FaUserCircle size={26} className="hover:text-[#C7B3FF]" />
              </button>

              <AnimatePresence>
                {menuAbierto && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg text-gray-700 py-2"
                  >
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 hover:bg-[#F3E8FF]"
                      onClick={() => setMenuAbierto(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/mis-ordenes"
                      className="block px-4 py-2 hover:bg-[#F3E8FF]"
                      onClick={() => setMenuAbierto(false)}
                    >
                      Mis Órdenes
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuAbierto(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F3E8FF]"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Login si no hay sesión */}
          {!token && (
            <Link
              to="/login"
              className="text-sm font-medium hover:text-[#C7B3FF] transition-colors"
            >
              Login
            </Link>
          )}

          {/* Carrito */}
          <Link
            to="/carrito"
            className="relative flex items-center bg-[#5B21B6] px-3 py-2 rounded-xl text-sm font-medium hover:bg-[#4C1D95] transition-colors"
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
