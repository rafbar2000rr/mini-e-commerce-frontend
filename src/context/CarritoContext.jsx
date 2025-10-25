import { createContext, useState, useEffect, useContext } from "react";

//-------------------------------------------------------------
// ✅ Creamos el contexto del carrito
//-------------------------------------------------------------
export const CarritoContext = createContext();

//-------------------------------------------------------------
// ✅ Hook personalizado
//-------------------------------------------------------------
export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de un <CarritoProvider>");
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
  // 🔹 Sincronizar carrito al iniciar sesión
  //-------------------------------------------------------------
  useEffect(() => {
    const sincronizarCarrito = async () => {
      if (!usuario?.token) return;

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
          const carritoNormalizado = data.map(item => ({
            _id: item.productoId._id,
            nombre: item.productoId.nombre,
            precio: item.productoId.precio,
            descripcion: item.productoId.descripcion,
            imagen: item.productoId.imagen,
            cantidad: item.cantidad,
          }));
          setCarrito(carritoNormalizado);
          localStorage.setItem("carrito", JSON.stringify(carritoNormalizado));
        }
      } catch (err) {
        console.error("❌ Error al sincronizar carrito:", err);
      }
    };

    sincronizarCarrito();
  }, [usuario?.token]);

  //-------------------------------------------------------------
  // 🔹 Agregar producto
  //-------------------------------------------------------------
  const agregarAlCarrito = async (producto) => {
    if (!producto?._id) return;
    const productoIdStr = producto._id.toString();

    setCarrito(prev => {
      const existe = prev.find(p => p._id === productoIdStr);
      const nuevoCarrito = existe
        ? prev.map(p =>
            p._id === productoIdStr
              ? { ...p, cantidad: (p.cantidad || 1) + 1 }
              : p
          )
        : [...prev, { ...producto, _id: productoIdStr, cantidad: 1 }];

      if (!usuario?.token) localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));

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
      } catch (err) {
        console.error("❌ Error agregando al carrito:", err);
      }
    }
  };

  //-------------------------------------------------------------
  // 🔹 Eliminar producto
  //-------------------------------------------------------------
  const eliminarDelCarrito = async (id) => {
    setCarrito(prev => prev.filter(p => p._id !== id));
    if (usuario?.token) {
      await fetch(`${API_URL}/api/carrito/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
    }
  };

  //-------------------------------------------------------------
  // 🔹 Vaciar carrito
  //-------------------------------------------------------------
  const vaciarCarrito = async () => {
    setCarrito([]);
    localStorage.removeItem("carrito");
    if (usuario?.token) {
      await fetch(`${API_URL}/api/carrito`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
    }
  };

  //-------------------------------------------------------------
  // 🔹 Actualizar cantidad
  //-------------------------------------------------------------
  const actualizarCantidad = async (id, cantidad) => {
    if (cantidad < 1) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito(prev =>
      prev.map(p => (p._id === id ? { ...p, cantidad } : p))
    );

    if (usuario?.token) {
      await fetch(`${API_URL}/api/carrito/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`,
        },
        body: JSON.stringify({ cantidad }),
      });
    }
  };

  //-------------------------------------------------------------
  // 🔹 Proveer contexto
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
