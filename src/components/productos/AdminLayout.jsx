// src/components/productos/AdminLayout.jsx
import { useState } from "react";
import { FaBox, FaClipboardList, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";

//---------------------------------------------------
// 🧭 Layout principal del panel de administración
//---------------------------------------------------
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();

  // 🔹 Cerrar sesión del admin
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (menú lateral) */}
      <aside
        className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
          menuOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Encabezado del menú */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {menuOpen && (
            <h1 className="text-xl font-bold text-blue-600 transition-opacity duration-300">
              Admin Panel
            </h1>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <FaBars className="text-gray-600" />
          </button>
        </div>

        {/* Navegación interna */}
        <nav className="p-4 space-y-2">
          <Link
            to="/admin/productos"
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
          >
            <FaBox />
            {menuOpen && <span>Productos</span>}
          </Link>

          <Link
            to="/admin/pedidos"
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
          >
            <FaClipboardList />
            {menuOpen && <span>Pedidos</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition"
          >
            <FaSignOutAlt />
            {menuOpen && <span>Salir</span>}
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Panel de Administración</h2>
          <span className="text-gray-500 text-sm">Bienvenido, Admin</span>
        </header>

        {/* Aquí se cargan los subcomponentes (productos/pedidos) */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
