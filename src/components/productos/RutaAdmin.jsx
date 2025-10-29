// src/components/RutaAdmin.jsx
import { Navigate } from "react-router-dom";

//----------------------------------------------------
// 🔐 Componente que protege las rutas del administrador
//----------------------------------------------------
export default function RutaAdmin({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // 🚫 No hay sesión iniciada
  if (!usuario) {
    alert("⚠️ Debes iniciar sesión para acceder al panel de administración.");
    return <Navigate to="/login" replace />;
  }

  // 🚫 Usuario común (no admin)
  if (usuario.rol !== "admin") {
    alert("❌ No tienes permisos para acceder al panel de administración.");
    return <Navigate to="/" replace />;
  }

  // ✅ Si pasa todas las validaciones, renderiza el contenido
  return children;
}
