import { useState, useEffect } from "react";
import axios from "axios";
import FormularioProducto from "./FormularioProducto";
import ListaProductos from "./ListaProductos";

export default function PanelProductos() {
  const [refrescar, setRefrescar] = useState(false); // 🔹 Para recargar lista
  const [productoEditando, setProductoEditando] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  // 🔹 Traer categorías al cargar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/categorias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategorias(res.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  // 🔹 Función para recargar lista cuando se agrega o edita un producto
  const handleProductoAgregado = (producto) => {
    setProductoEditando(null); // Reset edición
    setRefrescar((prev) => !prev); // Cambia estado para refrescar ListaProductos
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel de Productos</h1>

      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          {productoEditando ? "Editar Producto" : "Agregar Producto"}
        </h2>
        <FormularioProducto
          onProductoAgregado={handleProductoAgregado}
          productoEditando={productoEditando}
          categorias={categorias}
        />
      </div>

      <ListaProductos
        refrescar={refrescar}
        onEditar={(producto) => setProductoEditando(producto)} // Cuando hacen click en editar
      />
    </div>
  );
}
