// PanelPedidos.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListaPedidos from "./ListaPedidos";

export default function PanelPedidos() {
  const [refrescar, setRefrescar] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // 🔹 Forzamos refresco de la lista al cambiar pedidos
  const handleRefrescar = () => setRefrescar(!refrescar);

  // 🔹 Comprobar si el usuario es admin
  // useEffect(() => {
  //   const userData = localStorage.getItem("usuario");
  //   if (userData) {
  //     const user = JSON.parse(userData);
  //     setUsuario(user);

  //     if (user.rol !== "admin") {
  //       // 🚫 Usuario no admin: redirigir o mostrar mensaje
  //       alert("❌ No tienes permisos para acceder al panel de administración.");
  //       navigate("/"); // redirige al home o página segura
  //     }
  //   } else {
  //     // 🚨 No hay usuario logueado
  //     alert("❌ Debes iniciar sesión para acceder a esta página.");
  //     navigate("/login");
  //   }
  //   setCargando(false);
  // }, [navigate]);

  if (cargando) return <p className="p-8">Cargando...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Pedidos</h2>
      <ListaPedidos usuario={usuario} refrescar={refrescar} onRefrescar={handleRefrescar} />
    </div>
  );
}
