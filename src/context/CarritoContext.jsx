import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";

// -------------------------------------------------------------
// 💠 Contexto del carrito
// -------------------------------------------------------------
export const CarritoContext = createContext();

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de un <CarritoProvider>");
  return context;
}

// -------------------------------------------------------------
// 💠 Proveedor del carrito
// -------------------------------------------------------------
export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(() => {
    const userData = localStorage.getItem("usuario");
    return userData ? JSON.parse(userData) : null;
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const [socket, setSocket] = useState(null);

  // -------------------------------------------------------------
  // 🔹 Inicializar socket
  // -------------------------------------------------------------
  useEffect(() => {
    const newSocket = io(API_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Conectado a Socket.io. ID:", newSocket.id);
      // Entrar a room si hay usuario
      if (usuario?._id) newSocket.emit("join", usuario._id);
    });

    return () => newSocket.disconnect();
  }, []);

  // -------------------------------------------------------------
  // 🔹 Unirse a la room cuando cambia el usuario
  // -------------------------------------------------------------
  useEffect(() => {
    if (!socket || !usuario?._id) return;

    socket.emit("join", usuario._id);

    const actualizarCarrito = async () => {
      try {
        const res = await fetch(`${API_URL}/api/carrito`, {
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setCarrito(data);
        localStorage.setItem("carrito", JSON.stringify(data));
      } catch (err) {
        console.error("⚠️ Error actualizando carrito:", err);
      }
    };

    // Escuchar cambios en tiempo real
    socket.on(`carrito:${usuario._id}`, actualizarCarrito);

    // Limpiar listener
    return () => socket.off(`carrito:${usuario._id}`, actualizarCarrito);
  }, [socket, usuario?._id]);

  // -------------------------------------------------------------
  // 🔹 Funciones del carrito
  // -------------------------------------------------------------
  const emitirCambio = () => {
    if (socket && usuario?._id) socket.emit("carrito:update", usuario._id);
  };

  const agregarAlCarrito = async (producto) => {
    if (!producto?._id) return;

    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === producto._id);
      return existe
        ? prev.map((p) => (p._id === producto._id ? { ...p, cantidad: p.cantidad + 1 } : p))
        : [...prev, { ...producto, cantidad: 1 }];
    });

    if (!usuario?.token) return;

    try {
      await fetch(`${API_URL}/api/carrito`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${usuario.token}` },
        body: JSON.stringify({ productoId: producto._id, cantidad: 1 }),
      });
      emitirCambio();
    } catch (err) {
      console.error("⚠️ Error agregando al carrito:", err);
    }
  };

  const eliminarDelCarrito = async (id) => {
    setCarrito((prev) => prev.filter((p) => p._id !== id));
    if (!usuario?.token) return;

    try {
      await fetch(`${API_URL}/api/carrito/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      emitirCambio();
    } catch (err) {
      console.error("⚠️ Error eliminando producto:", err);
    }
  };

  const vaciarCarrito = async () => {
    setCarrito([]);
    if (!usuario?.token) return;

    try {
      await fetch(`${API_URL}/api/carrito`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      emitirCambio();
    } catch (err) {
      console.error("⚠️ Error vaciando carrito:", err);
    }
  };

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return eliminarDelCarrito(id);

    setCarrito((prev) => prev.map((p) => (p._id === id ? { ...p, cantidad: nuevaCantidad } : p)));
    if (!usuario?.token) return;

    try {
      await fetch(`${API_URL}/api/carrito/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${usuario.token}` },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });
      emitirCambio();
    } catch (err) {
      console.error("⚠️ Error actualizando cantidad:", err);
    }
  };

  // -------------------------------------------------------------
  // 💠 Exportar contexto
  // -------------------------------------------------------------
  return (
    <CarritoContext.Provider
      value={{
        carrito,
        setCarrito,
        usuario,
        setUsuario,
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        actualizarCantidad,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}
