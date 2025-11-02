import { useState } from "react";
import { FaBox, FaClipboardList, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";

//---------------------------------------------------
// 🧭 Layout principal del panel de administración (responsive)
//---------------------------------------------------
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 🔹 Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Fondo oscuro cuando el menú está abierto en móvil */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 
          ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:w-64 w-64`}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          <Link
            to="/admin/productos"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
          >
            <FaBox />
            <span>Productos</span>
          </Link>

          <Link
            to="/admin/pedidos"
            onClick={() => setMenuOpen(false)}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
          >
            <FaClipboardList />
            <span>Pedidos</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition w-full text-left"
          >
            <FaSignOutAlt />
            <span>Salir</span>
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa visible solo en móvil */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMenuOpen(true)}
            >
              <FaBars size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              Panel de Administración
            </h2>
          </div>
          <span className="text-gray-500 text-sm">Bienvenido, Admin</span>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
