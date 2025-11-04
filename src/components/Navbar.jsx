import { useState, useContext, useEffect } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { carrito, setCarrito, setUsuario, totalProductos } = useContext(CarritoContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuarioLocal] = useState(null); // 👈 estado local del usuario
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ✅ Obtener nombre de usuario si hay sesión
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuarioLocal(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrito');
    setUsuario(null);
    setCarrito([]);
    setUsuarioLocal(null);
    setMenuOpen(false);
    navigate('/catalogo');
  };

  // ✅ Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-purple-600 shadow-md">
      <nav className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center text-white">
        {/* Logo */}
        <Link to="/" className="text-lg font-semibold hover:text-violet-200 transition">
          mini e-commerce
        </Link>

        <div className="flex items-center gap-4 relative">
          {/* 👋 Saludo visible en pantallas medianas o grandes */}
          {usuario && (
            <span className="hidden sm:block text-sm font-medium">
              Hola, {usuario.nombre || usuario.name} 
            </span>
          )}

          {/* Menú de usuario */}
          {token ? (
            <div className="relative user-menu">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-90 focus:outline-none"
              >
                <FaUserCircle size={22} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-xl shadow-[0_4px_12px_rgba(168,85,247,0.3)] overflow-hidden animate-fadeIn">
                  <div className="absolute right-3 -top-2 w-3 h-3 bg-white rotate-45 shadow-sm"></div>

                  {/* 👋 Saludo visible dentro del menú (ideal para móviles) */}
                  {usuario && (
                    <div className="px-4 py-2 text-sm font-medium text-violet-700 border-b border-violet-100">
                      Hola, {usuario.nombre || usuario.name} 
                    </div>
                  )}

                  <Link
                    to="/mi-perfil"
                    className="block px-4 py-2 hover:bg-violet-100 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/mis-ordenes"
                    className="block px-4 py-2 hover:bg-violet-100 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mis Órdenes
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-violet-100 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              className="text-sm font-medium bg-white text-violet-700 px-3 py-2 rounded-xl hover:bg-violet-100 transition"
            >
              Login
            </Link>
          )}

          {/* Carrito */}
          <Link
            to="/carrito"
            className="relative flex items-center bg-white text-violet-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-violet-100 transition"
          >
            <FaShoppingCart size={18} />
            {totalProductos > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalProductos}
            </span>
            )}

          </Link>
        </div>
      </nav>
    </header>
  );
}
