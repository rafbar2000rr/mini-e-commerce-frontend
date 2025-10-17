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
    <nav className="navbar">
      {/* Logo → inicio */}
      <div className="navbar-left">
        <Link to="/" className="logo">Mini E-Commerce</Link>
      </div>

      {/* Navegación derecha */}
      <div className="navbar-right">
        {/* ✅ Login o Logout según sesión */}
        {!token ? (
          <Link to="/login" className="logout-btn">Login</Link>
        ) : (
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        )}

        {/* Mis Órdenes solo si está logueado */}
        {token && (
          <Link to="/mis-ordenes" className="nav-link">Mis Órdenes</Link>
        )}

        {/* Carrito */}
        <Link to="/carrito" className="carrito-icono">
          <FaShoppingCart size={20} />
          {carrito.length > 0 && (
            <span className="cantidad">{carrito.length}</span>
          )}
        </Link>
      </div>
    </nav>
  );
}
