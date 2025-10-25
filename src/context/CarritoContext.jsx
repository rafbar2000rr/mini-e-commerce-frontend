import { createContext, useState, useEffect, useContext } from "react";

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
  //-------------------------------------------------------------
  // 🔹 Estado del carrito y del usuario
  //-------------------------------------------------------------
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
  // 🔹 Sincronizar carrito con backend al iniciar sesión
  //-------------------------------------------------------------
  useEffect(() => {
    const sincronizarCarrito = async () => {
      if (!usuario?.token || carrito.length === 0) return;

      try {
        const res = await fetch(`${API_URL}/api/carrito/sincronizar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usuario.token}`,
          },
          body: JSON.stringify({ carritoLocal: carrito }),
        });

        if (res.ok) {
          const data = await res.json();
          const carritoNormalizado = (data || []).map((item) => ({
            _id: item.productoId._id,
            nombre: item.productoId.nombre,
            precio: item.productoId.precio,
            descripcion: item.productoId.descripcion,
            imagen: item.productoId.imagen,
            cantidad: item.cantidad,
          }));

          // ✅ Actualizar estado y localStorage con el carrito fusionado
          setCarrito(carritoNormalizado);
          localStorage.setItem("carrito", JSON.stringify(carritoNormalizado));
        }
      } catch (error) {
        console.error("❌ Error al sincronizar carrito:", error);
      }
    };

    sincronizarCarrito();
  }, [usuario?.token]);

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

      // 💾 Guardar en localStorage si no hay usuario logueado
      if (!usuario?.token) {
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      }

      return nuevoCarrito;
    });

    // 🔐 Si está logueado, también lo guarda en el backend
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
