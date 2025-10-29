//====================================================
// ProtectedRoute.jsx
// Bloquea el acceso a rutas si el usuario no ha iniciado sesión
//====================================================

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { usuario, loading } = useAuth();

  // -----------------------------------------------------
  // ⏳ Mientras carga la sesión, no mostrar nada aún
  // -----------------------------------------------------
  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Verificando sesión...</p>;
  }

  // -----------------------------------------------------
  // 🔒 Si no hay usuario, redirigir al login
  // -----------------------------------------------------
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // -----------------------------------------------------
  // ✅ Si hay usuario, mostrar el contenido protegido
  // -----------------------------------------------------
  return <Outlet />;
}
