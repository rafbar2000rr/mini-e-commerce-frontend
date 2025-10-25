import { createContext, useState, useEffect, useContext } from "react";
import { socket } from "../socket"; // ✅ Importamos la conexión de Socket.io

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

  //-------------------------------------------------------------
  // 🔹 Guardar carrito en localStorage
  //-------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  //-------------------------------------------------------------
  // 🔹 Recuperar carrito del backend y sincronizar con Socket.io
  //-------------------------------------------------------------
  useEffect(() => {
    if (!usuario?.token) return;

    const fetchCarrito = async () => {
      try {
        const res = await fetch(`${API_URL}/api/carrito`, {
          headers: { Authorization: `Bearer ${usuario.token}` },
        });

        const data = res.ok ? await res.json() : [];
        const carritoBackend = (data?.productos || []).map((item) => ({
          _id: item.productoId._id,
          nombre: item.productoId.nombre,
          precio: item.productoId.precio,
          descripcion: item.productoId.descripcion,
          imagen: item.productoId.imagen,
          cantidad: item.cantidad,
        }));

        setCarrito(carritoBackend);
        localStorage.setItem("carrito", JSON.stringify(carritoBackend));
      } catch (error) {
        console.error("❌ Error al recuperar el carrito:", error);
      }
    };

    fetchCarrito();

    //-------------------------------------------------------------
    // 🎧 Escuchar actualizaciones en tiempo real del carrito
    //-------------------------------------------------------------
    socket.on(`carrito:${usuario.id}`, fetchCarrito);

    // 🧹 Limpiar el listener al desmontar
    return () => {
      socket.off(`carrito:${usuario.id}`, fetchCarrito);
    };
  }, [usuario?.token]);

  //-------------------------------------------------------------
  // 🔹 Agregar producto al carrito
  //-------------------------------------------------------------
  const agregarAlCarrito = async (producto) => {
    if (!producto || !producto._id) return;
    const productoIdStr = producto._id.toString();

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

        // 🚀 Emitir actualización a otros dispositivos del mismo usuario
        socket.emit("carrito:update", usuario.id);
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

        // 🚀 Notificar a otros dispositivos
        socket.emit("carrito:update", usuario.id);
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

        // 🚀 Notificar a otros dispositivos
        socket.emit("carrito:update", usuario.id);
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

        // 🚀 Notificar a otros dispositivos
        socket.emit("carrito:update", usuario.id);
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
