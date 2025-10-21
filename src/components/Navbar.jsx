import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

//---------------------
//Barra de navegación.
//---------------------
export default function Navbar() {
  const { carrito, setCarrito, setUsuario } = useContext(CarritoContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // 👈 verificamos sesión

  // ✅ Cerrar sesión
  const handleLogout = () => {
    // 🔹 1. Borras el token del localStorage
    localStorage.removeItem('token');
    
    // 🔹 2. Borras el usuario guardado en localStorage
    localStorage.removeItem('usuario');
    
    // 🔹 3. Limpias el estado en memoria (React) → usuario null
    setUsuario(null);
    
    // 🔹 4. Limpias el carrito en memoria (React) → se pone en []
    setCarrito([]); 
    
    // 🔹 5. También borras cualquier carrito guardado en localStorage
    localStorage.removeItem("carrito"); 
    
    // 🔹 6. Rediriges al usuario a la página de login
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo → inicio */}
        <div className="navbar-left">
          <Link 
            to="/" 
            className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors"
          >
            Mini E-Commerce
          </Link>
        </div>

        {/* Navegación derecha */}
        <div className="navbar-right flex items-center gap-4">
          {/* ✅ Login o Logout según sesión */}
          {!token ? (
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
          ) : (
            <button 
              className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}

          {/* Mis Órdenes solo si está logueado */}
          {token && (
            <Link 
              to="/mis-ordenes" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Mis Órdenes
            </Link>
          )}

          {/* Carrito */}
          <Link 
            to="/carrito" 
            className="relative flex items-center bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
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
