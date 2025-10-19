import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

//---------------------
// Barra de navegación.
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
    <header className="sticky top-0 z-50 bg-purple-600 text-white shadow-md">
      <nav className="flex justify-between items-center max-w-6xl mx-auto px-6 py-3">
        {/* Logo → inicio */}
        <div className="navbar-left">
          <Link
            to="/"
            className="text-xl font-semibold hover:text-yellow-300 transition-colors"
          >
            Mini E-Commerce
          </Link>
        </div>

        {/* Navegación derecha */}
        <div className="flex items-center gap-6">
          {/* ✅ Login o Logout según sesión */}
          {!token ? (
            <Link
              to="/login"
              className="text-sm font-medium hover:text-yellow-300 transition-colors"
            >
              Login
            </Link>
          ) : (
            <button
              className="text-sm font-medium hover:text-yellow-300 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}

          {/* Mis Órdenes solo si está logueado */}
          {token && (
            <Link
              to="/mis-ordenes"
              className="text-sm font-medium hover:text-yellow-300 transition-colors"
            >
              Mis Órdenes
            </Link>
          )}

          {/* Carrito */}
          <Link to="/carrito" className="relative">
            <FaShoppingCart size={20} className="hover:text-yellow-300 transition-colors" />
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {carrito.length}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
