import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica si hay token al cargar
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    // Elimina token y cambia estado
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/catalogo"); // Redirige al catálogo
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-violet-600 text-white">
      <Link to="/catalogo" className="font-bold text-lg">
        E-Commerce
      </Link>

      <div className="flex gap-4 items-center">
        <Link to="/catalogo" className="hover:underline">
          Catálogo
        </Link>
        <Link to="/carrito" className="hover:underline">
          Carrito
        </Link>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-violet-800 hover:bg-violet-900 px-3 py-1 rounded"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-white text-violet-600 px-3 py-1 rounded hover:bg-gray-200"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
