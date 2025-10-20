import { useState, useContext, useEffect } from "react";
import { CarritoContext } from "../context/CarritoContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Checkout() {
  const { carrito, setCarrito } = useContext(CarritoContext);

  const [cliente, setCliente] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
  });
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [error, setError] = useState("");

  // ✅ Tu API URL pública en Railway
  const API_URL = import.meta.env.VITE_API_URL; // ej: https://mini-e-commerce-backend-production.up.railway.app/api

  // 🔹 Autocompletar usuario logueado
  useEffect(() => {
    const fetchUsuario = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Por favor inicia sesión antes de hacer una compra 💖");
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente 💖");
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          console.warn("⚠️ No se pudo obtener el usuario.");
          setError("No se pudo cargar tu información 💕");
          return;
        }

        const data = await res.json();
        setCliente((prev) => ({
          ...prev,
          nombre: data.nombre || "",
          email: data.email || "",
        }));
      } catch (err) {
        console.error("❌ Error obteniendo usuario:", err);
        setError("Error conectando con el servidor 💕");
      } finally {
        setLoadingUsuario(false);
      }
    };

    fetchUsuario();
  }, [API_URL]);

  const handleChange = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const total = carrito.reduce(
    (acc, producto) => acc + (producto.precio || 0) * (producto.cantidad || 1),
    0
  );

  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
      }}
    >
      <div className="flex flex-col items-center min-h-screen bg-pink-50 p-6">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">Checkout 💖</h1>

        {/* Resumen del carrito */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-pink-500 mb-4">
            Resumen del carrito
          </h2>
          {carrito.length > 0 ? (
            <ul className="space-y-2 mb-4">
              {carrito.map((p) => (
                <li key={p._id || p.id} className="flex justify-between">
                  <span>{p.nombre} x {p.cantidad}</span>
                  <span>${((p.precio || 0) * (p.cantidad || 1)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Tu carrito está vacío 😢</p>
          )}
          <h3 className="text-lg font-semibold text-pink-600">
            Total: ${total.toFixed(2)}
          </h3>
        </div>

        {/* Datos de envío */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-pink-500 mb-4">
            Datos de envío
          </h2>

          {error && <p className="text-red-500">{error}</p>}

          {loadingUsuario ? (
            <p className="text-gray-500">Cargando tus datos...</p>
          ) : (
            <>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={cliente.nombre}
                onChange={handleChange}
                className="w-full p-3 border border-pink-200 bg-gray-100 rounded-lg"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={cliente.email}
                onChange={handleChange}
                className="w-full p-3 border border-pink-200 bg-gray-100 rounded-lg"
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={cliente.direccion}
                onChange={handleChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                type="text"
                name="ciudad"
                placeholder="Ciudad"
                value={cliente.ciudad}
                onChange={handleChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                type="text"
                name="codigoPostal"
                placeholder="Código postal"
                value={cliente.codigoPostal}
                onChange={handleChange}
                className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </>
          )}

          {/* Botón PayPal */}
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={async () => {
              const productos = carrito.map((p) => ({
                productoId: p._id || p.id,
                cantidad: p.cantidad || 1,
              }));
              const res = await fetch(`${API_URL}/paypal/api/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ total, productos, datosCliente: cliente }),
              });
              const data = await res.json();
              return data?.id;
            }}
            onApprove={async (data) => {
              const token = localStorage.getItem("token");
              const productos = carrito.map((p) => ({
                productoId: p._id || p.id,
                cantidad: p.cantidad || 1,
              }));
              const res = await fetch(`${API_URL}/paypal/api/capture-order/${data.orderID}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productos, datosCliente: cliente }),
              });
              const capture = await res.json();

              if (!res.ok) {
                const mensaje = capture?.detalle || capture?.error || "Error al procesar la compra";
                setError(mensaje);
                alert("❌ " + mensaje);
                return;
              }

              setCarrito([]);
              localStorage.removeItem("carrito");
              alert("Pago completado con PayPal 💖 Tu pedido ha sido registrado.");
              window.location.href = "/mis-ordenes";
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
