import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🔹 Permite acceso solo a usuarios logueados
export default function ProtectedRoute() {
  const { usuario } = useAuth();

  // Si no hay usuario logueado, redirige al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Muestra el contenido protegido
}
