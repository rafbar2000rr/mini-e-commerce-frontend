import { useState } from "react";
import ListaPedidos from "./ListaPedidos";

export default function PanelPedidos() {
  const [refrescar, setRefrescar] = useState(false);

  // 🔹 Forzamos refresco de la lista al cambiar pedidos (ej: editar estado)
  const handleRefrescar = () => setRefrescar(!refrescar);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📦 Gestión de Pedidos</h2>
      <ListaPedidos refrescar={refrescar} onRefrescar={handleRefrescar} />
    </div>
  );
}
