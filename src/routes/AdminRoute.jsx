//====================================================
// AdminRoute.jsx
// Bloquea rutas solo para administradores
//====================================================

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Verificando permisos...</p>;
  }

  // ❌ Si no hay usuario o su rol no es "admin", redirige al catálogo
  if (!usuario || usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Mostrar el contenido del admin
  return <Outlet />;
}
