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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Pedidos</h2>
      <ListaPedidos usuario={usuario} refrescar={refrescar} onRefrescar={handleRefrescar} />
    </div>
  );
}
