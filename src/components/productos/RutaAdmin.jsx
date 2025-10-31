import { Navigate } from "react-router-dom";

export default function RutaAdmin({ children }) {
  const usuarioData = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  if (!usuarioData || !token) {
    alert("❌ Debes iniciar sesión para acceder al panel de administración.");
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(usuarioData);

  if (usuario.rol !== "admin") {
    alert("❌ No tienes permisos para acceder al panel de administración.");
    return <Navigate to="/" replace />;
  }

  return children;
}
