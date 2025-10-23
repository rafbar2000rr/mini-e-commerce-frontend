import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Swal} from "sweetalert2";

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
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
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
        const res = await fetch(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError("No se pudo cargar la información del usuario 💕");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUsuario({
          nombre: data.nombre || "",
          email: data.email || "",
          direccion: data.direccion || "",
          ciudad: data.ciudad || "",
          codigoPostal: data.codigoPostal || "",
        });
      } catch (err) {
        console.error("❌ Error obteniendo usuario:", err);
        setError("Error conectando con el servidor 💕");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, []);

  // 🔹 Manejar cambios
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  // 🔹 Guardar cambios
  const handleGuardar = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuario),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.error || "No se pudo actualizar tu perfil 💕",
          confirmButtonColor: "#a855f7",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado 💖",
        text: "Tus datos se han guardado correctamente.",
        confirmButtonColor: "#a855f7",
      });
    } catch (err) {
      console.error("❌ Error actualizando perfil:", err);
      Swal.fire({
        icon: "error",
        title: "Error 💕",
        text: "Error conectando con el servidor.",
        confirmButtonColor: "#a855f7",
      });
    }
  };

  if (loading)
    return <p className="text-gray-500 text-center mt-10">Cargando perfil...</p>;
  if (error && !usuario.nombre)
    return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-purple-700">Mi Perfil</h1>

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

      {/* 💜 Botón de volver al catálogo */}
      <button
        onClick={() => navigate("/")}
        className="mt-3 w-full bg-purple-100 text-purple-700 p-3 rounded-lg hover:bg-purple-200 font-medium transition-colors"
      >
        ← Volver al Catálogo
      </button>
    </div>
  );
}
