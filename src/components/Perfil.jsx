import { useState, useEffect } from "react";

export default function Perfil() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
  });
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // 🔹 Cargar datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // usuario no logueado

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar tus datos");
        const data = await res.json();
        setUsuario(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [API_URL]);

  // 🔹 Actualizar campos localmente
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  // 🔹 Guardar cambios en backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuario),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      setMensaje("✅ Datos actualizados correctamente!");
    } catch (err) {
      console.error(err);
      setMensaje("❌ No se pudo actualizar. Intenta de nuevo.");
    }
  };

  if (loading) return <p>Cargando tus datos...</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil 💖</h1>
      {mensaje && <p className="mb-4">{mensaje}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={usuario.nombre}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={usuario.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={usuario.direccion || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={usuario.ciudad || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          name="codigoPostal"
          placeholder="Código postal"
          value={usuario.codigoPostal || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <button
          type="submit"
          className="w-full p-3 bg-pink-600 text-white rounded-lg font-semibold"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
