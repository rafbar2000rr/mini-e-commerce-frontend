// ✅ Componente de Registro
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from "../context/CarritoContext";

//-----------------------------------------
// Registra al usuario en la base de datos y sincroniza carrito
//-----------------------------------------
function Registro() {
  // ✅ Estados para controlar los campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Estado para mostrar mensajes de error o éxito
  const [mensaje, setMensaje] = useState('');

  // ✅ Hook de navegación de React Router
  const navigate = useNavigate();

  // ✅ Obtenemos setUsuario desde el contexto para guardar usuario logueado
  const { setUsuario } = useContext(CarritoContext);

  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Función que maneja el registro del usuario
  const handleRegistro = async (e) => {
    e.preventDefault(); // prevenimos recarga de la página

    try {
      // 🔹 Enviamos datos al backend
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🔹 Si hay error en registro
        setMensaje(data.error || 'Error en el registro 💕');
        return;
      }

      // ✅ Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // ✅ Guardar usuario en contexto
      setUsuario({ ...data.user, token: data.token });

      // 🔹 Sincronizar carrito si hay items locales
      const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
      if (carritoLocal.length > 0) {
        const syncRes = await fetch(`${API_URL}/carrito/sincronizar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ carritoLocal }),
        });

        if (syncRes.ok) {
          const carritoFinal = await syncRes.json();
          localStorage.setItem("carrito", JSON.stringify(carritoFinal));
        }
      }

      // ✅ Redirigir al catálogo o inicio
      navigate("/catalogo");
    } catch (err) {
      console.error("❌ Error registro:", err);
      setMensaje('Error de conexión 💕');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Título */}
      <h2 className="text-xl font-bold mb-4">Registro</h2>

      {/* Formulario */}
      <form onSubmit={handleRegistro} className="space-y-4">
        {/* Campo Nombre */}
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Campo Correo */}
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Campo Contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Botón de registro */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Registrarse
        </button>
      </form>

      {/* Mensaje de error si existe */}
      {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
    </div>
  );
}

export default Registro;
