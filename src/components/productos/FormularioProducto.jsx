import { useState, useEffect } from "react";
import axios from "axios";

export default function FormularioProducto({ onProductoAgregado, productoEditando, categorias }) {
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    categoria: "",
    stock: "", // 👈 agregado
  });
  const [imagen, setImagen] = useState(null);

  const enEdicion = Boolean(productoEditando);

  // 🔹 Llenar formulario si estamos editando
  useEffect(() => {
    if (productoEditando) {
      setForm({
        nombre: productoEditando.nombre,
        precio: productoEditando.precio,
        descripcion: productoEditando.descripcion,
        categoria: productoEditando.categoria?._id || "",
        stock: productoEditando.stock || 0, // 👈 cargar stock existente
      });
      setImagen(null);
    }
  }, [productoEditando]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("precio", form.precio);
    formData.append("descripcion", form.descripcion);
    formData.append("categoria", form.categoria);
    formData.append("stock", form.stock); // 👈 enviar stock
    if (imagen) formData.append("imagen", imagen);

    try {
      if (enEdicion) {
        await axios.put(`http://localhost:5000/productos/${productoEditando._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://localhost:5000/productos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // limpiar formulario
      setForm({ nombre: "", precio: "", descripcion: "", categoria: "", stock: "" });
      setImagen(null);
      onProductoAgregado();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const handleCancelar = () => {
    setForm({ nombre: "", precio: "", descripcion: "", categoria: "", stock: "" });
    setImagen(null);
    onProductoAgregado();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="border w-full p-2 rounded-lg"
      />
      <input
        name="precio"
        placeholder="Precio"
        type="number"
        value={form.precio}
        onChange={(e) => setForm({ ...form, precio: e.target.value })}
        className="border w-full p-2 rounded-lg"
      />
      <textarea
        name="descripcion"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        className="border w-full p-2 rounded-lg"
      />

      <select
        name="categoria"
        value={form.categoria}
        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        className="border w-full p-2 rounded-lg"
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      {/* 🔹 Campo de stock */}
      <input
        name="stock"
        type="number"
        placeholder="Cantidad disponible"
        min="0"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
        className="border w-full p-2 rounded-lg"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagen(e.target.files[0])}
        className="border w-full p-2 rounded-lg"
      />

      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          {enEdicion ? "Actualizar" : "Agregar"} Producto
        </button>

        {enEdicion && (
          <button
            type="button"
            onClick={handleCancelar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
