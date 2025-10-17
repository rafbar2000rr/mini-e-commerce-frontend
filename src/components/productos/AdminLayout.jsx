import { useState } from "react"; // 🔹 Hook para manejar estados
import { FaBox, FaSignOutAlt, FaBars } from "react-icons/fa"; // 🔹 Íconos de react-icons
import { Link, useNavigate } from "react-router-dom"; // 🔹 Link para navegación interna y useNavigate para redirigir

//------------------------------------------------------------------------------------------------------------------
//Envuelve otras páginas y les da una estructura común: sidebar, header y área principal.
//-----------------------------------------------------------------------------------------------------------------
export default function AdminLayout({ children }) { // 🔹 Componente principal que recibe children (contenido dinámico)
  const [menuOpen, setMenuOpen] = useState(true); // 🔹 Estado para abrir/cerrar el sidebar
  const navigate = useNavigate(); // 🔹 Hook para redirigir a otras rutas

  // 🔹 Función para salir
  const handleLogout = () => {
    localStorage.removeItem("token"); // 🔹 Elimina el token guardado en el navegador
    navigate("/login"); // 🔹 Redirige al login después de cerrar sesión
  };

  return (
    <div className="flex min-h-screen bg-gray-100"> {/* 🔹 Layout principal con fondo gris y pantalla completa */}
      
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
          menuOpen ? "w-64" : "w-20" // 🔹 Ancho depende de si está abierto (64) o cerrado (20)
        }`}
      >
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* Logo/Título solo si el menú está abierto */}
          {menuOpen && (
            <h1 className="text-xl font-bold text-blue-600 transition-opacity duration-300">
              Admin Panel {/* 🔹 Texto visible solo cuando el menú está abierto */}
            </h1>
          )}

          {/* Botón hamburguesa SIEMPRE visible */}
          <button onClick={() => setMenuOpen(!menuOpen)}> {/* 🔹 Alterna abrir/cerrar sidebar */}
            <FaBars className="text-gray-600" /> {/* 🔹 Icono hamburguesa */}
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {/* 🔹 Navegar a productos */}
          <Link
            to="/admin/productos" // 🔹 Redirige a la página de productos
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
          >
            <FaBox /> {/* 🔹 Icono de caja */}
            {menuOpen && <span>Productos</span>} {/* 🔹 Texto solo si el menú está abierto */}
          </Link>

          {/* 🔹 Botón para salir */}
          <button
            onClick={handleLogout} // 🔹 Llama a la función logout
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition"
          >
            <FaSignOutAlt /> {/* 🔹 Icono de salir */}
            {menuOpen && <span>Salir</span>} {/* 🔹 Texto solo si el menú está abierto */}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col"> {/* 🔹 Contenedor principal del contenido */}
        
        {/* Header */}
        <header className="bg-white shadow p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Panel de Administración</h2> {/* 🔹 Título principal */}
          <span className="text-gray-500 text-sm">Bienvenido, Admin</span> {/* 🔹 Texto pequeño de bienvenida */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main> {/* 🔹 Aquí se renderiza el contenido dinámico */}
      </div>
    </div>
  );
}
