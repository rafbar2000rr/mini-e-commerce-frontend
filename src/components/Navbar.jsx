import { useContext, useState, useRef, useEffect } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { carrito, setCarrito, setUsuario } = useContext(CarritoContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setCarrito([]);
    localStorage.removeItem("carrito");
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-purple-600 text-white shadow-md">
      <nav className="flex justify-between items-center max-w-6xl mx-auto px-6 py-3">
        {/* Logo */}
        <div className="navbar-left">
          <Link
            to="/"
            className="text-xl font-semibold hover:text-yellow-300 transition-colors"
          >
            Mini E-Commerce
          </Link>
        </div>

        {/* Navegación derecha */}
        <div className="flex items-center gap-6 relative">
          {/* Carrito */}
          <Link to="/carrito" className="relative">
            <FaShoppingCart size={20} className="hover:text-yellow-300 transition-colors" />
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {carrito.length}
              </span>
            )}
          </Link>

          {/* Login o Dropdown */}
          {!token ? (
            <Link
              to="/login"
              className="text-sm font-medium hover:text-yellow-300 transition-colors"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-1 text-sm font-medium hover:text-yellow-300 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaUserCircle size={20} />
              </button>

              {/* Dropdown animado */}
              <div
                className={`
                  absolute right-0 mt-2 w-40 bg-white text-purple-900 rounded-lg shadow-lg overflow-hidden z-50
                  transform transition-all duration-300 origin-top-right
                  ${dropdownOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
                `}
              >
                <Link
                  to="/mi-perfil"
                  className="block px-4 py-2 hover:bg-purple-100 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  Mi Perfil
                </Link>
                <Link
                  to="/mis-ordenes"
                  className="block px-4 py-2 hover:bg-purple-100 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  Mis Órdenes
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-purple-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
