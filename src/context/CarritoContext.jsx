import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";

//-------------------------------------------------------------
// ✅ Creamos el contexto del carrito
//-------------------------------------------------------------
export const CarritoContext = createContext();

//-------------------------------------------------------------
// ✅ Hook personalizado para acceder fácilmente al carrito
//-------------------------------------------------------------
export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error("useCarrito debe usarse dentro de un <CarritoProvider>");
  }
  return context;
}

//-------------------------------------------------------------
// ✅ Proveedor del carrito
//-------------------------------------------------------------
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

  //-------------------------------------------------------------
  // 🔹 Conectar Socket.io al iniciar sesión
  //-------------------------------------------------------------
  useEffect(() => {
    if (usuario?.token && !socket) {
      const newSocket = io(API_URL, {
        auth: { token: usuario.token },
      });
      setSocket(newSocket);

      // Escuchar eventos del carrito de otros dispositivos
      newSocket.on(`carrito:${usuario._id}`, async () => {
        try {
          const res = await fetch(`${API_URL}/api/carrito`, {
            headers: { Authorization: `Bearer ${usuario.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCarrito(data);
            localStorage.setItem("carrito", JSON.stringify(data));
          }
        } catch (error) {
          console.error("❌ Error al actualizar carrito desde socket:", error);
        }
      });

      // Limpiar al desconectarse
      return () => newSocket.disconnect();
    }
  }, [usuario?.token]);

  //-------------------------------------------------------------
  // 🔹 Guardar carrito en localStorage
  //-------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  //-------------------------------------------------------------
  // 🔹 Agregar producto al carrito
  //-------------------------------------------------------------
  const agregarAlCarrito = async (producto) => {
    if (!producto || !producto._id) return;
    const productoIdStr = producto._id.toString();

    // 🛒 Actualiza el estado local
    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === productoIdStr);
      const nuevoCarrito = existe
        ? prev.map((p) =>
            p._id === productoIdStr
              ? { ...p, cantidad: (p.cantidad || 1) + 1 }
              : p
          )
        : [...prev, { ...producto, _id: productoIdStr, cantidad: 1 }];

      if (!usuario?.token) {
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      }

      return nuevoCarrito;
    });

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usuario.token}`,
          },
          body: JSON.stringify({ productoId: productoIdStr, cantidad: 1 }),
        });
        // 🔔 Emitir evento para otros dispositivos
        socket?.emit("carrito:update", usuario._id);
      } catch (error) {
        console.error("❌ Error agregando al carrito:", error);
      }
    }
  };

  //-------------------------------------------------------------
  // 🔹 Eliminar producto del carrito
  //-------------------------------------------------------------
  const eliminarDelCarrito = async (id) => {
    setCarrito((prev) => prev.filter((p) => p._id?.toString() !== id.toString()));

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
        socket?.emit("carrito:update", usuario._id);
      } catch (error) {
        console.error("❌ Error al eliminar producto:", error);
      }
    }
  };

  //-------------------------------------------------------------
  // 🔹 Vaciar carrito completo
  //-------------------------------------------------------------
  const vaciarCarrito = async () => {
    setCarrito([]);
    localStorage.removeItem("carrito");

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
        socket?.emit("carrito:update", usuario._id);
      } catch (error) {
        console.error("❌ Error al vaciar carrito:", error);
      }
    }
  };

  //-------------------------------------------------------------
  // 🔹 Actualizar cantidad
  //-------------------------------------------------------------
  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(id);
      return;
    }

    setCarrito((prev) =>
      prev.map((p) =>
        p._id?.toString() === id.toString()
          ? { ...p, cantidad: nuevaCantidad }
          : p
      )
    );

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/api/carrito/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usuario.token}`,
          },
          body: JSON.stringify({ cantidad: nuevaCantidad }),
        });
        socket?.emit("carrito:update", usuario._id);
      } catch (error) {
        console.error("❌ Error al actualizar cantidad:", error);
      }
    }
  };

  //-------------------------------------------------------------
  // 🔹 Proveer contexto a toda la app
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
