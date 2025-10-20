import { useEffect, useState } from "react";

export default function MiPerfil() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL; // ej: https://mini-e-commerce-backend-production.up.railway.app/auth
  const token = localStorage.getItem("token");

  // 🔹 Traer datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      if (!token) {
        setError("Debes iniciar sesión 💖");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError("No se pudo cargar la información del usuario 💕");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUsuario((prev) => ({
          ...prev,
          nombre: data.nombre || "",
          email: data.email || "",
          direccion: data.direccion || "",
          ciudad: data.ciudad || "",
          codigoPostal: data.codigoPostal || "",
        }));
      } catch (err) {
        console.error("❌ Error obteniendo usuario:", err);
        setError("Error conectando con el servidor 💕");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, []);

  // 🔹 Manejar cambios en inputs
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  // 🔹 Guardar cambios en la base de datos
  const handleGuardar = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/actualizar-usuario`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuario),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo actualizar tu perfil 💕");
        return;
      }

      setSuccess("Perfil actualizado correctamente 💖");
    } catch (err) {
      console.error("❌ Error actualizando perfil:", err);
      setError("Error conectando con el servidor 💕");
    }
  };

  if (loading) return <p className="text-gray-500 text-center mt-10">Cargando perfil...</p>;
  if (error && !usuario.nombre) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-purple-700">Mi Perfil</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <div className="space-y-3">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={usuario.nombre}
          onChange={handleChange}
          className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={usuario.email}
          onChange={handleChange}
          className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={usuario.direccion}
          onChange={handleChange}
          className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={usuario.ciudad}
          onChange={handleChange}
          className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="text"
          name="codigoPostal"
          placeholder="Código postal"
          value={usuario.codigoPostal}
          onChange={handleChange}
          className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <button
        onClick={handleGuardar}
        className="mt-4 w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Guardar cambios
      </button>
    </div>
  );
}
