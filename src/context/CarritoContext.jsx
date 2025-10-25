import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";

//-------------------------------------------------------------
// 💠 Contexto del carrito
//-------------------------------------------------------------
export const CarritoContext = createContext();

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de un <CarritoProvider>");
  return context;
}

//-------------------------------------------------------------
// 💠 Proveedor del carrito
//-------------------------------------------------------------
export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(() => {
    const userData = localStorage.getItem("usuario");
    return userData ? JSON.parse(userData) : null;
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const [socket, setSocket] = useState(null);

  //-------------------------------------------------------------
  // 🔹 Inicializar socket
  //-------------------------------------------------------------
  useEffect(() => {
    const newSocket = io(API_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket conectado ID:", newSocket.id);
      if (usuario?._id) newSocket.emit("join", usuario._id);
    });

    newSocket.on("connect_error", (err) => console.error("❌ Error socket:", err.message));

    return () => newSocket.disconnect();
  }, []);

  //-------------------------------------------------------------
  // 🔹 Escuchar actualizaciones del carrito
  //-------------------------------------------------------------
  useEffect(() => {
    if (socket && usuario?._id) {
      // Entrar a la room del usuario
      socket.emit("join", usuario._id);

      const actualizarCarrito = async () => {
        try {
          const res = await fetch(`${API_URL}/api/carrito`, {
            headers: { Authorization: `Bearer ${usuario.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const carritoMapeado = data.map((item) => ({
              _id: item.productoId._id,
              nombre: item.productoId.nombre,
              precio: item.productoId.precio,
              descripcion: item.productoId.descripcion,
              imagen: item.productoId.imagen,
              cantidad: item.cantidad,
            }));
            setCarrito(carritoMapeado);
          }
        } catch (err) {
          console.error("⚠️ Error cargando carrito:", err);
        }
      };

      // Escuchar cambios desde el servidor
      socket.on(`carrito:${usuario._id}`, actualizarCarrito);

      // Cargar carrito al unirse
      actualizarCarrito();

      return () => socket.off(`carrito:${usuario._id}`, actualizarCarrito);
    }
  }, [socket, usuario?._id]);

  //-------------------------------------------------------------
  // 🔹 Funciones de carrito
  //-------------------------------------------------------------
  const emitirCambio = () => {
    if (socket && usuario?._id) socket.emit("carrito:update", usuario._id);
  };

  const agregarAlCarrito = async (producto) => {
    if (!producto?._id) return;
    const productoIdStr = producto._id.toString();

    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === productoIdStr);
      return existe
        ? prev.map((p) => (p._id === productoIdStr ? { ...p, cantidad: p.cantidad + 1 } : p))
        : [...prev, { ...producto, _id: productoIdStr, cantidad: 1 }];
    });

    if (usuario?.token) {
      await fetch(`${API_URL}/api/carrito`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${usuario.token}` },
        body: JSON.stringify({ productoId: productoIdStr, cantidad: 1 }),
      });
      emitirCambio();
    }
  };

  const eliminarDelCarrito = async (id) => {
    setCarrito((prev) => prev.filter((p) => p._id?.toString() !== id.toString()));

    if (usuario?.token) {
      await fetch(`${API_URL}/api/carrito/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      emitirCambio();
    }
  };

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return eliminarDelCarrito(id);

    setCarrito((prev) =>
      prev.map((p) => (p._id?.toString() === id.toString() ? { ...p, cantidad: nuevaCantidad } : p))
    );

    if (usuario?.token) {
      await fetch(`${API_URL}/api/carrito/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${usuario.token}` },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });
      emitirCambio();
    }
  };

  const vaciarCarrito = async () => {
    setCarrito([]);
    if (usuario?.token) {
      await fetch(`${API_URL}/api/carrito`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      emitirCambio();
    }
  };

  //-------------------------------------------------------------
  // 💠 Exportar contexto
  //-------------------------------------------------------------
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
