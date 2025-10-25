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
  // 🔹 Inicializar Socket.io
  //-------------------------------------------------------------
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Conectado al backend con Socket.io:", newSocket.id);
      if (usuario?._id) newSocket.emit("join", usuario._id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Error de conexión:", err.message);
    });

    return () => newSocket.disconnect();
  }, [API_URL, usuario?._id]);

  //-------------------------------------------------------------
  // 🔹 Unirse a la room del usuario y escuchar carrito
  //-------------------------------------------------------------
  useEffect(() => {
    if (socket && usuario?._id) {
      socket.emit("join", usuario._id);

      const actualizarCarrito = async () => {
        try {
          if (!usuario.token) return;
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
            localStorage.setItem("carrito", JSON.stringify(carritoMapeado));
          }
        } catch (err) {
          console.error("⚠️ Error actualizando carrito:", err);
        }
      };

      socket.on(`carrito:${usuario._id}`, actualizarCarrito);

      return () => socket.off(`carrito:${usuario._id}`, actualizarCarrito);
    }
  }, [socket, usuario]);

  //-------------------------------------------------------------
  // 🔹 Cargar carrito al iniciar sesión
  //-------------------------------------------------------------
  useEffect(() => {
    const cargarCarrito = async () => {
      if (!usuario?.token) return;
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
          localStorage.setItem("carrito", JSON.stringify(carritoMapeado));
        }
      } catch (err) {
        console.error("⚠️ Error cargando carrito:", err);
      }
    };
    cargarCarrito();
  }, [usuario?.token]);

  //-------------------------------------------------------------
  // 🔹 Emitir evento de actualización
  //-------------------------------------------------------------
  const emitirCambio = () => {
    if (socket && usuario?._id) socket.emit("carrito:update", usuario._id);
  };

  //-------------------------------------------------------------
  // 🔹 Funciones de carrito
  //-------------------------------------------------------------
  const agregarAlCarrito = async (producto) => {
    if (!producto?._id) return;
    const productoId = producto._id.toString();

    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === productoId);
      const nuevoCarrito = existe
        ? prev.map((p) => (p._id === productoId ? { ...p, cantidad: p.cantidad + 1 } : p))
        : [...prev, { ...producto, _id: productoId, cantidad: 1 }];
      localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${usuario.token}` },
          body: JSON.stringify({ productoId, cantidad: 1 }),
        });
        emitirCambio();
      } catch (err) {
        console.error("⚠️ Error agregando al carrito:", err);
      }
    }
  };

  const eliminarDelCarrito = async (id) => {
    setCarrito((prev) => {
      const nuevoCarrito = prev.filter((p) => p._id?.toString() !== id.toString());
      localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });

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

  const actualizarCantidad = async (id, cantidad) => {
    if (cantidad < 1) return eliminarDelCarrito(id);

    setCarrito((prev) =>
      prev.map((p) => (p._id?.toString() === id.toString() ? { ...p, cantidad } : p))
    );

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${usuario.token}` },
          body: JSON.stringify({ cantidad }),
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
