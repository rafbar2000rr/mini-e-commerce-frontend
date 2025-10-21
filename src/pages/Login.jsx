import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from "../context/CarritoContext";

//----------------------
//Identifica al usuario
//----------------------
function Login() {
  // ✅ Estados para email, contraseña y mensajes de error/estado
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // ✅ Hook para redirigir después del login
  const navigate = useNavigate();

  // ✅ Obtenemos setUsuario desde el contexto para guardar el usuario logueado
  const { setUsuario } = useContext(CarritoContext); 

  // ✅ Manejo del login
  const handleLogin = async (e) => {
  e.preventDefault();
  const API_URL = import.meta.env.VITE_API_URL; // ejemplo: https://.../auth

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Credenciales incorrectas 💕");
      return;
    }

    // ✅ Guardar token y usuario en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.user));

    // ✅ Guardar en contexto
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

    navigate("/catalogo");
  } catch (err) {
    console.error("❌ Error login:", err);
    setMessage("Error de conexión 💕");
  }
};


  // ✅ Renderizado del formulario de login
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>

      {/* Formulario de login */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Campo correo */}
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Campo contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* Botón para enviar el formulario */}
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ingresar
        </button>
      </form>

      {/* Enlace hacia registro */}
      <p className="mt-4 text-sm text-center">
        ¿No tienes cuenta?{' '}
        <span
          className="text-blue-300 underline cursor-pointer"
          onClick={() => navigate('/registro')}
        >
          Regístrate aquí
        </span>
      </p>

      {/* Mensajes de error/red */}
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}

export default Login;
