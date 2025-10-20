import { useEffect, useState } from "react";
import axios from "axios";

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token"); // 👈 debe existir el token
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 este formato es obligatorio
          },
        });
        setPerfil(res.data);
      } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
      }
    };

    fetchPerfil();
  }, []);

  if (!perfil) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>
      <p><strong>Nombre:</strong> {perfil.nombre}</p>
      <p><strong>Email:</strong> {perfil.email}</p>
      <p><strong>Dirección:</strong> {perfil.direccion || "No especificada"}</p>
      <p><strong>Ciudad:</strong> {perfil.ciudad || "No especificada"}</p>
      <p><strong>Código Postal:</strong> {perfil.codigoPostal || "No especificado"}</p>
    </div>
  );
}
