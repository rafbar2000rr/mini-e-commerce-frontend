//====================================================
// Login.jsx
// Página de inicio de sesión para usuarios y admin
//====================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Ahora usamos AuthContext

export default function Login() {
  //----------------------------------------
  // 🔹 Estados para manejar campos y mensajes
  //----------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ login viene del AuthContext

  //----------------------------------------
  // 🔹 Manejar el login del usuario
  //----------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    // ⚠️ Validación básica antes de enviar
    if (!email.includes("@") || password.length < 4) {
      setMessage("Por favor, ingresa un correo y una contraseña válidos.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Llamamos a la función login() del contexto
      const userData = await login(email, password);

      // ✅ Redirigir según el rol del usuario
      if (userData?.rol === "admin") {
        navigate("/admin/pedidos");
      } else {
        navigate("/catalogo");
      }
    } catch (err) {
      console.error("⚠️ Error en login:", err);
      setMessage(err.message || "Credenciales incorrectas o error del servidor.");
    } finally {
      setLoading(false);
    }
  };

  //----------------------------------------
  // 🔹 Renderizado del formulario de login
  //----------------------------------------
  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Iniciar sesión
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold text-white transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow"
          }`}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600">
        ¿No tienes cuenta?{" "}
        <span
          className="text-blue-500 underline cursor-pointer hover:text-blue-700"
          onClick={() => navigate("/registro")}
        >
          Regístrate aquí
        </span>
      </p>

      {/* Mensaje de error o advertencia */}
      {message && (
        <p className="mt-4 text-center text-red-600 font-medium">{message}</p>
      )}
    </div>
  );
}
