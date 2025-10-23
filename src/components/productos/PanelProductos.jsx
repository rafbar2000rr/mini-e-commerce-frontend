import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import FormularioProducto from "./FormularioProducto";
import ListaProductos from "./ListaProductos";

export default function PanelProductos() {
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [refrescar, setRefrescar] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // 🔹 Cargar categorías al inicio
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const resCategorias = await axios.get(`${API_URL}/api/categorias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategorias(resCategorias.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  // 🔹 Cargar productos con búsqueda y paginación
  const fetchProductos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, search },
      });

      setProductos(res.data.productos);
      setPages(res.data.pages);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, [page, search, refrescar]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // 🔹 Cuando se agrega o edita un producto
  const handleProductoAgregado = (nuevoProducto) => {
    setRefrescar(prev => !prev); // fuerza recarga
    setProductoEditando(null);
  };

  // 🔹 Eliminar producto
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefrescar(prev => !prev);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  // 🔹 Actualizar stock
  const handleActualizarStock = async (id, cantidad) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`${API_URL}/api/productos/${id}/stock`, { cantidad }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(prev => prev.map(p => p._id === id ? res.data.producto : p));
    } catch (error) {
      console.error("Error al actualizar stock:", error);
    }
  };

  return (
    <div className="space-y-8">
      <FormularioProducto
        onProductoAgregado={handleProductoAgregado}
        productoEditando={productoEditando}
        categorias={categorias}
      />
      <ListaProductos
        productos={productos}
        onEditar={setProductoEditando}
        onEliminar={handleEliminar}
        onActualizarStock={handleActualizarStock}
        page={page}
        setPage={setPage}
        pages={pages}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
}
