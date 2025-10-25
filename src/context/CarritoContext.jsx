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
  // 🔹 Inicializar Socket.io
  //-------------------------------------------------------------
  useEffect(() => {
    const newSocket = io(API_URL); // Asegúrate de que API_URL tenga http:// o https://
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  //-------------------------------------------------------------
  // 🔹 Escuchar eventos de carrito en tiempo real
  //-------------------------------------------------------------
  useEffect(() => {
    if (!socket || !usuario?._id) return;

    socket.on(`carrito:${usuario._id}`, async () => {
      try {
        const res = await fetch(`${API_URL}/api/carrito`, {
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
        const data = await res.json();
        setCarrito(
          data.map((item) => ({
            _id: item.productoId._id,
            nombre: item.productoId.nombre,
            precio: item.productoId.precio,
            descripcion: item.productoId.descripcion,
            imagen: item.productoId.imagen,
            cantidad: item.cantidad,
          }))
        );
        localStorage.setItem("carrito", JSON.stringify(data));
      } catch (err) {
        console.error("Error actualizando carrito en tiempo real:", err);
      }
    });

    return () => socket.off(`carrito:${usuario._id}`);
  }, [socket, usuario?.token, usuario?._id]);

  //-------------------------------------------------------------
  // 🔹 Guardar carrito en localStorage
  //-------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  //-------------------------------------------------------------
  // 🔹 Cargar carrito desde backend al iniciar sesión
  //-------------------------------------------------------------
  useEffect(() => {
    const cargarCarrito = async () => {
      if (!usuario?.token) return;
      try {
        const res = await fetch(`${API_URL}/api/carrito`, {
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
        const data = await res.json();
        setCarrito(
          data.map((item) => ({
            _id: item.productoId._id,
            nombre: item.productoId.nombre,
            precio: item.productoId.precio,
            descripcion: item.productoId.descripcion,
            imagen: item.productoId.imagen,
            cantidad: item.cantidad,
          }))
        );
        localStorage.setItem("carrito", JSON.stringify(data));
      } catch (err) {
        console.error("Error cargando carrito:", err);
      }
    };
    cargarCarrito();
  }, [usuario?.token]);

  //-------------------------------------------------------------
  // 🔹 Emitir evento de carrito actualizado al backend
  //-------------------------------------------------------------
  const emitirCambio = () => {
    if (socket && usuario?._id) {
      socket.emit("carrito:update", usuario._id);
    }
  };

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
        emitirCambio();
      } catch (err) {
        console.error("Error agregando al carrito:", err);
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
        emitirCambio();
      } catch (err) {
        console.error("Error eliminando producto:", err);
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
        emitirCambio();
      } catch (err) {
        console.error("Error vaciando carrito:", err);
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
        emitirCambio();
      } catch (err) {
        console.error("Error actualizando cantidad:", err);
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
