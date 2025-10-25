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
  const [socket, setSocket] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  //-------------------------------------------------------------
  // 🔹 Inicializar socket solo cuando usuario esté listo
  //-------------------------------------------------------------
  useEffect(() => {
    if (!usuario?.token) return;

    const newSocket = io(API_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Conectado al backend con Socket.io. ID:", newSocket.id);
      newSocket.emit("join", usuario._id); // Entrar a su room
    });

    newSocket.on("connect_error", (err) => {
      console.log("❌ Error de conexión:", err.message);
    });

    return () => newSocket.disconnect();
  }, [usuario]);

  //-------------------------------------------------------------
  // 🔹 Función para cargar carrito desde API
  //-------------------------------------------------------------
  const cargarCarrito = async () => {
    if (!usuario?.token) return;
    try {
      const res = await fetch(`${API_URL}/api/carrito`, {
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      if (!res.ok) throw new Error("Error cargando carrito");
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
      localStorage.setItem("carrito", JSON.stringify(carritoMapeado));
    } catch (err) {
      console.error("⚠️ Error cargando carrito:", err);
    }
  };

  //-------------------------------------------------------------
  // 🔹 Escuchar cambios del carrito en tiempo real
  //-------------------------------------------------------------
  useEffect(() => {
    if (!socket || !usuario?._id) return;

    const actualizarCarrito = () => {
      cargarCarrito();
    };

    socket.on(`carrito:${usuario._id}`, actualizarCarrito);

    // Cargar carrito inmediatamente al montar
    cargarCarrito();

    return () => socket.off(`carrito:${usuario._id}`, actualizarCarrito);
  }, [socket, usuario]);

  //-------------------------------------------------------------
  // 🔹 Guardar carrito en localStorage cuando cambia
  //-------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  //-------------------------------------------------------------
  // 🔹 Emitir evento de actualización al backend
  //-------------------------------------------------------------
  const emitirCambio = () => {
    if (socket && usuario?._id) socket.emit("carrito:update", usuario._id);
  };

  //-------------------------------------------------------------
  // 🔹 Funciones del carrito
  //-------------------------------------------------------------
  const agregarAlCarrito = async (producto) => {
    if (!producto || !producto._id) return;
    const productoIdStr = producto._id.toString();

    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === productoIdStr);
      const nuevoCarrito = existe
        ? prev.map((p) => (p._id === productoIdStr ? { ...p, cantidad: p.cantidad + 1 } : p))
        : [...prev, { ...producto, _id: productoIdStr, cantidad: 1 }];
      if (!usuario?.token) localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${usuario.token}` },
          body: JSON.stringify({ productoId: productoIdStr, cantidad: 1 }),
        });
        emitirCambio();
      } catch (err) {
        console.error("⚠️ Error agregando al carrito:", err);
      }
    }
  };

  const eliminarDelCarrito = async (id) => {
    setCarrito((prev) => prev.filter((p) => p._id?.toString() !== id.toString()));
    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
        emitirCambio();
      } catch (err) {
        console.error("⚠️ Error eliminando producto:", err);
      }
    }
  };

  const vaciarCarrito = async () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
        emitirCambio();
      } catch (err) {
        console.error("⚠️ Error vaciando carrito:", err);
      }
    }
  };

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return eliminarDelCarrito(id);

    setCarrito((prev) =>
      prev.map((p) => (p._id?.toString() === id.toString() ? { ...p, cantidad: nuevaCantidad } : p))
    );

    if (usuario?.token) {
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
