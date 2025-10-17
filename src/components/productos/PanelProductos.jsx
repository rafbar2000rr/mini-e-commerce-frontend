import { useState, useEffect } from "react";
import axios from "axios";
import FormularioProducto from "./FormularioProducto";
import ListaProductos from "./ListaProductos";

export default function PanelProductos() {
  const [refrescar, setRefrescar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  // 🔹 Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get("http://localhost:5000/categorias");
        setCategorias(res.data);
      } catch (error) {
        console.error("❌ Error al cargar categorías:", error.message);
      }
    };
    fetchCategorias();
  }, [refrescar]);

  // 🔹 Agregar nueva categoría
  const handleAgregarCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/categorias", { nombre: nuevaCategoria });
      setCategorias([...categorias, res.data]); // ✅ agregamos directo al estado
      setNuevaCategoria("");
    } catch (error) {
      console.error("❌ Error al agregar categoría:", error.message);
    }
  };

  // 🔹 Eliminar categoría
  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;
    try {
      await axios.delete(`http://localhost:5000/categorias/${id}`);
      setCategorias(categorias.filter((c) => c._id !== id)); // ✅ actualizamos sin refrescar
    } catch (error) {
      console.error("❌ Error al eliminar categoría:", error.message);
    }
  };

  // 🔹 Manejar producto agregado o actualizado
  const handleProductoAgregado = () => {
    setRefrescar(!refrescar);
    setProductoEditando(null);
  };

  const handleEditar = (producto) => {
    setProductoEditando(producto);
  };

  return (
    <div className="space-y-8">
      {/* Formulario para crear categorías */}
      <form onSubmit={handleAgregarCategoria} className="flex space-x-2">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="border p-2 rounded-lg w-full"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Agregar
        </button>
      </form>

      {/* Mostrar categorías existentes con botón de eliminar */}
      <div className="flex flex-wrap gap-2">
        {categorias.map((cat) => (
          <span
            key={cat._id}
            className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
          >
            <span>{cat.nombre}</span>
            <button
              onClick={() => handleEliminarCategoria(cat._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-full text-xs"
            >
              X
            </button>
          </span>
        ))}
      </div>

      {/* Formulario de productos */}
      <FormularioProducto
        onProductoAgregado={handleProductoAgregado}
        productoEditando={productoEditando}
        categorias={categorias}   // ✅ pasamos categorías como prop
      />

      {/* Lista de productos */}
      <ListaProductos refrescar={refrescar} onEditar={handleEditar} />
    </div>
  );
}
