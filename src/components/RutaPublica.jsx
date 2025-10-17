import { Navigate } from "react-router-dom";

export default function RutaPublica({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/catalogo" />;
  }
  return children;
}
