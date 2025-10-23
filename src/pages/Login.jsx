import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUsuario } = useContext(CarritoContext);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    // ⚠️ Validación básica
    if (!email.includes("@") || password.length < 4) {
      setMessage("Por favor, ingresa un correo y una contraseña válidos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Guardar token y usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.user));

        // ✅ Sincronizar carrito local si existe
        const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
        if (carritoLocal.length > 0) {
          const syncRes = await fetch(`${API_URL}/api/carrito/sincronizar`, {
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

        // ✅ Guardar usuario en contexto
        setUsuario({ token: data.token, ...data.user });

        // ✅ Redirigir al catálogo
        navigate("/catalogo");
      } else {
        // ❌ Mostrar error del backend
        setMessage(data.msg || "Credenciales incorrectas.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

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

      {message && (
        <p className="mt-4 text-center text-red-600 font-medium">{message}</p>
      )}
    </div>
  );
}
