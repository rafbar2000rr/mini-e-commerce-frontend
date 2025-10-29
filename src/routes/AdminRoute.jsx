import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🔹 Permite acceso solo a administradores
export default function AdminRoute() {
  const { usuario } = useAuth();

  // Si no hay usuario, redirige al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no es admin, lo redirige al inicio
  if (usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Muestra el contenido solo si es admin
}
