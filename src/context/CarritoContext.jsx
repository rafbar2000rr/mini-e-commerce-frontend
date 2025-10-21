import { createContext, useState, useEffect } from "react";

//------------------------------------------------------------------
// ✅ Creamos el contexto para poder usar el carrito en toda la app
//------------------------------------------------------------------
export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  // ✅ Estado del carrito: inicializa desde localStorage
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });

  // ✅ Estado del usuario logueado (null si no está logueado)
  const [usuario, setUsuario] = useState(() => {
    const userData = localStorage.getItem("usuario");
    return userData ? JSON.parse(userData) : null;
  });

  const API_URL = import.meta.env.VITE_API_URL;

  //-----------------------------------------------------------------------------------
  // ✅ Siempre guardar carrito en localStorage (haya login o no)
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  //------------------------------------------------------------------------------------
  // ✅ Recuperar carrito desde el backend cuando el usuario se loguea
  useEffect(() => {
    const fetchCarrito = async () => {
      if (usuario?.token) {
        try {
          // 🔹 Traer carrito desde backend
          const res = await fetch(`${API_URL}/carrito`, {
            headers: { Authorization: `Bearer ${usuario.token}` },
          });

          if (res.ok) {
            const data = await res.json();

            // 3️⃣ Normalizamos la respuesta para tener siempre el mismo formato
            const carritoNormalizado = (data || []).map((item) => ({
              _id: item.productoId._id,
              nombre: item.productoId.nombre,
              precio: item.productoId.precio,
              descripcion: item.productoId.descripcion,
              imagen: item.productoId.imagen,
              cantidad: item.cantidad,
            }));

            // 4️⃣ Si el backend está vacío pero el frontend tenía productos en localStorage
            if (carritoNormalizado.length === 0 && carrito.length > 0) {
              for (const prod of carrito) {
                await fetch(`${API_URL}/carrito`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${usuario.token}`,
                  },
                  body: JSON.stringify({
                    productoId: prod._id,
                    cantidad: prod.cantidad,
                  }),
                });
              }
            } else {
              // 5️⃣ Si el backend tiene productos, los usamos para actualizar el carrito
              setCarrito(carritoNormalizado);
            }
          }
        } catch (error) {
          console.error("Error al recuperar el carrito:", error);
        }
      }
    };
    fetchCarrito();
  }, [usuario?.token]); // se vuelve a correr cuando cambia el usuario/token

  //----------------------------------------------------------------------------

  // 🔹 Agregar producto al carrito
  const agregarAlCarrito = async (producto) => {
    if (!producto || !producto._id) return;

    const productoIdStr = producto._id.toString();

    // 3️⃣ Actualiza el carrito en el estado de React
    setCarrito((prev) => {
      const existe = prev.find((p) => p._id === productoIdStr);
      return existe
        ? prev.map((p) =>
            p._id === productoIdStr
              ? { ...p, cantidad: (p.cantidad || 1) + 1 }
              : p
          )
        : [...prev, { ...producto, _id: productoIdStr, cantidad: 1 }];
    });

    // 4️⃣ Si el usuario está logueado, también guarda el cambio en el backend
    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/carrito`, {
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

  //---------------------------------------------------------------------------

  // 🔹 Elimina el producto del carrito
  const eliminarDelCarrito = async (id) => {
    setCarrito((prev) => prev.filter((p) => p._id?.toString() !== id.toString()));

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/carrito/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
      } catch (error) {
        console.error("❌ Error al eliminar producto:", error);
      }
    }
  };

  //----------------------------------------------------------------------------------

  // 🔹 Vaciar carrito completo
  const vaciarCarrito = async () => {
    setCarrito([]);
    localStorage.removeItem("carrito");

    if (usuario?.token) {
      try {
        await fetch(`${API_URL}/carrito`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${usuario.token}` },
        });
      } catch (error) {
        console.error("❌ Error al vaciar carrito:", error);
      }
    }
  };

  //--------------------------------------------------------------------------------------

  // 🔹 Actualizar cantidad de un producto
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
        await fetch(`${API_URL}/carrito/${id}`, {
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

  //--------------------------------------------------------------------------------
  // ✅ Exponemos valores y funciones para que los use toda la app
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
