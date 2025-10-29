import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";

export const CarritoContext = createContext();

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de un <CarritoProvider>");
  return context;
}

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [usuario, setUsuario] = useState(() => {
    const userData = localStorage.getItem("usuario");
    return userData ? JSON.parse(userData) : null;
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const [socket, setSocket] = useState(null);

  // -------------------------------------------------------------
  // 🔹 Inicializar Socket.io
  // -------------------------------------------------------------
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Conectado al backend con Socket.io. ID:", newSocket.id);
      if (usuario?.id) newSocket.emit("join", usuario.id);
    });

    newSocket.on("connect_error", (err) => {
      console.log("❌ Error de conexión:", err.message);
    });

    return () => newSocket.disconnect();
  }, []);

  // -------------------------------------------------------------
  // 🔹 Escuchar cambios en tiempo real
  // -------------------------------------------------------------
  useEffect(() => {
    if (socket && usuario?.id) {
      socket.emit("join", usuario.id);

      const actualizarCarrito = async () => {
        try {
          const res = await fetch(`${API_URL}/api/carrito`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

      socket.on(`carrito:${usuario.id}`, actualizarCarrito);
      return () => socket.off(`carrito:${usuario.id}`, actualizarCarrito);
    }
  }, [socket, usuario?.id]);

  // -------------------------------------------------------------
  // 🔹 Cargar carrito al iniciar sesión
  // -------------------------------------------------------------
useEffect(() => {
  const cargarCarrito = async () => {
    const token = localStorage.getItem("token");
    if (!token || !usuario) return;
    try {
      const res = await fetch(`${API_URL}/api/carrito`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  cargarCarrito();
}, [usuario]);


  // -------------------------------------------------------------
  // 🔹 Emitir cambio
  // -------------------------------------------------------------
  const emitirCambio = () => {
    if (socket && usuario?.id) socket.emit("carrito:update", usuario.id);
  };

  // -------------------------------------------------------------
  // 🔹 Funciones del carrito
  // -------------------------------------------------------------
  const agregarAlCarrito = async (producto) => {
  if (!producto || !producto._id) return;
  const productoIdStr = producto._id.toString();
  const token = localStorage.getItem("token");

  console.log("🛒 Intentando agregar producto al carrito:", producto);

  setCarrito((prev) => {
    const existe = prev.find((p) => p._id === productoIdStr);
    const nuevoCarrito = existe
      ? prev.map((p) =>
          p._id === productoIdStr ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      : [...prev, { ...producto, _id: productoIdStr, cantidad: 1 }];
    if (!token)
      localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    console.log("✅ Carrito actualizado localmente:", nuevoCarrito);
    return nuevoCarrito;
  });

  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productoId: productoIdStr, cantidad: 1 }),
      });

      console.log("📡 Respuesta del backend:", res.status);

      emitirCambio();
    } catch (err) {
      console.error("⚠️ Error agregando al carrito:", err);
    }
  }
};


  const eliminarDelCarrito = async (id) => {
    const token = localStorage.getItem("token");
    setCarrito((prev) => prev.filter((p) => p._id?.toString() !== id.toString()));

    if (token) {
      try {
        await fetch(`${API_URL}/api/carrito/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        emitirCambio();
      } catch (err) {
        console.error("⚠️ Error eliminando producto:", err);
      }
    }
  };

  const vaciarCarrito = async () => {
    const token = localStorage.getItem("token");
    setCarrito([]);
    localStorage.removeItem("carrito");

    if (token) {
      try {
        await fetch(`${API_URL}/api/carrito`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        emitirCambio();
      } catch (err) {
        console.error("⚠️ Error vaciando carrito:", err);
      }
    }
  };

  const actualizarCantidad = async (id, nuevaCantidad) => {
    const token = localStorage.getItem("token");
    if (nuevaCantidad < 1) return eliminarDelCarrito(id);

    setCarrito((prev) =>
      prev.map((p) => (p._id?.toString() === id.toString() ? { ...p, cantidad: nuevaCantidad } : p))
    );

    if (token) {
      try {
        await fetch(`${API_URL}/api/carrito/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cantidad: nuevaCantidad }),
        });
        emitirCambio();
      } catch (err) {
        console.error("⚠️ Error actualizando cantidad:", err);
      }
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
