import { createContext, useState, useEffect } from "react";

//------------------------------------------------------------------
// ✅ Creamos el contexto para poder usar el carrito en toda la app
//------------------------------------------------------------------
export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  // ✅ Estado del carrito: inicializa desde localStorage
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];//parse: Convierte el string en un objeto o arreglo real de JavaScript.
  });

  // ✅ Estado del usuario logueado (null si no está logueado)
  const [usuario, setUsuario] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  //-----------------------------------------------------------------------------------
  // ✅ Siempre guardar carrito en localStorage (haya login o no)
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));//JSON.stringify → convierte un objeto/array en texto.
  }, [carrito]);
  
  //------------------------------------------------------------------------------------
  // ✅ Recuperar carrito desde el backend cuando el usuario se loguea
  useEffect(() => {//Revisa si el usuario está logueado (si hay usuario?.token).Pide al backend el carrito con fetch.Normaliza los datos para que el carrito en React siempre tenga el mismo formato.Sincroniza:Si el backend está vacío pero había productos en localStorage 👉 manda esos productos al backend.Si el backend ya tiene productos 👉 reemplaza el carrito del frontend con esos datos.Mantiene consistencia entre frontend, backend y localStorage.Se ejecuta automáticamente cuando el componente se monta o cuando cambia el usuario.token.
    const fetchCarrito = async () => {
      if (usuario?.token) {// 1️⃣ Solo si el usuario está logueado
        try {
          
          const res = await fetch(`${API_URL}/carrito`, {
            headers: { Authorization: `Bearer ${usuario.token}` },// se manda el token
          });
          if (res.ok) {// 2️⃣ Si la respuesta es correcta (200-299)
            const data = await res.json();// la data es lo que manda el backend

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
            if (carritoNormalizado.length === 0 && carrito.length > 0) {// sincronizamos el carrito local hacia el backend
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
    fetchCarrito();// 6️⃣ Se ejecuta al entrar o cuando cambia el token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.token]); // se vuelve a correr cuando cambia el usuario/token
  
  //----------------------------------------------------------------------------
  // 🔹 Agregar producto al carrito.Valida que el producto sea correcto y tenga _id.Convierte el id a string para evitar errores de comparación.Actualiza el carrito en React:Si el producto ya existe, aumenta su cantidad.Si no existe, lo agrega como nuevo con cantidad: 1.Sincroniza con el backend (si hay usuario con token) para que el carrito también quede guardado en la base de datos
  const agregarAlCarrito = async (producto) => {
    if (!producto || !producto._id) return; // 1️⃣ Si no existe el producto o no tiene id, no hace nada

  const productoIdStr = producto._id.toString(); // 2️⃣ Asegura que el id sea un string
// 3️⃣ Actualiza el carrito en el estado de React
    setCarrito((prev) => {//prev 👉 es el estado anterior del carrito(la lista de productos antes de agregar el nuevo. Es un array de objetos, cada objeto es un producto).Usar esta forma es más seguro, porque React garantiza que actualizas con el último valor correcto.
      const existe = prev.find((p) => p._id === productoIdStr);//find recorre el array y devuelve el primer elemento cuyo id del producto (p._id) sea igual al id que quiero agregar (productoIdStr)
      return existe
        ? prev.map((p) =>// Si ya existe, recorre el array
            p._id === productoIdStr//p._id es el identificador único de ese producto (normalmente viene de la base de datos, MongoDB o similar).productoIdStr es el id del producto que el usuario quiere agregar al carrito (ya convertido a string).
              ? { ...p, cantidad: (p.cantidad || 1) + 1 }//crea un nuevo objeto producto con todas sus propiedades originales, pero actualizando su cantidad a la anterior + 1, o partiendo de 1 si no existía.
              : p
          )
        : [...prev, { ...producto, _id: productoIdStr, cantidad: 1 }];//Copiamos todos los productos anteriores (...prev) y agregamos un nuevo objeto con cantidad inicial = 1. ...producto:copia todas las propiedades del objeto producto.
    });

    // 4️⃣ Si el usuario está logueado, también guarda el cambio en el backend
  if (usuario?.token) {
    try {
      await fetch(`${API_URL}/carrito`, {
        method: "POST", // se crea/agrega producto en el carrito de la BD
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`, // el token valida quién es el usuario
        },
        body: JSON.stringify({ productoId: productoIdStr, cantidad: 1 }),
      });
    } catch (error) {
      console.error("❌ Error agregando al carrito:", error);
    }
  }
};
  
  //---------------------------------------------------------------------------
  // 🔹 Elimina el producto del carrito en la interfaz (estado de React) → usando filter mantiene todos los productos menos el que tiene el id dado.Si el usuario está logueado, también lo elimina en la base de datos haciendo un DELETE al backend. Si ocurre un error al comunicarse con el servidor, lo muestra en consola pero no afecta al carrito en pantalla, porque ya se actualizó localmente.
  const eliminarDelCarrito = async (id) => {
  // 1️⃣ Actualiza el estado del carrito en React:
  setCarrito((prev) =>
    // Deja todos los productos excepto el que tenga el id a eliminar
    prev.filter((p) => p._id?.toString() !== id.toString())
  );

  // 2️⃣ Si el usuario está logueado (tiene un token):
  if (usuario?.token) {
    try {
      // 3️⃣ Hace una petición al backend para eliminar ese producto de la base de datos
      await fetch(`${API_URL}/carrito/${id}`, {
        method: "DELETE", // se usa DELETE porque queremos borrar un recurso
        headers: { Authorization: `Bearer ${usuario.token}` }, // se manda el token para autenticación
      });
    } catch (error) {
      // 4️⃣ Si hay error al conectarse con el backend, lo muestra en consola
      console.error("❌ Error al eliminar producto:", error);
    }
  }
};

  //----------------------------------------------------------------------------------
  // 🔹 Vaciar carrito completo. El carrito se vacía en tres niveles:UI (estado).Navegador (localStorage).Servidor (base de datos).
  const vaciarCarrito = async () => {
  // 1️⃣ Limpia el carrito en memoria (estado de React)
  setCarrito([]);

  // 2️⃣ Elimina el carrito almacenado en el navegador (persistencia local)
  localStorage.removeItem("carrito");

  // 3️⃣ Si el usuario está logueado y tiene un token válido...
  if (usuario?.token) {
    try {
      // 4️⃣ Manda una petición al backend para vaciar el carrito en la base de datos
      await fetch(`${API_URL}/carrito`, {
        method: "DELETE", // indica que quieres borrar recursos
        headers: { Authorization: `Bearer ${usuario.token}` }, // pasas el token de autenticación
      });
    } catch (error) {
      // 5️⃣ Si hay error en la petición, lo muestra en consola
      console.error("❌ Error al vaciar carrito:", error);
    }
  }
};
  
  //--------------------------------------------------------------------------------------
  // 🔹 Actualizar cantidad de un producto. El carrito se sincroniza en 3 lugares:En pantalla (estado de React).En el navegador (localStorage, si lo usas en otra parte).En el servidor (base de datos).
  const actualizarCantidad = async (id, nuevaCantidad) => {
  // 1️⃣ Si la nueva cantidad es menor a 1, simplemente se elimina el producto del carrito
  if (nuevaCantidad < 1) {
    eliminarDelCarrito(id); // llama a otra función que borra el producto
    return; // corta la ejecución aquí
  }
  // 2️⃣ Actualiza el carrito en el estado de React
  setCarrito((prev) =>
    prev.map((p) =>
      // Busca el producto que tenga el mismo id
      p._id?.toString() === id.toString()
        // Si lo encuentra, crea un nuevo objeto con la cantidad actualizada
        ? { ...p, cantidad: nuevaCantidad }
        // Si no es ese producto, lo deja igual
        : p
    )
  );
  // 3️⃣ Si el usuario está logueado, también actualiza el carrito en la base de datos
  if (usuario?.token) {
    try {
      await fetch(`${API_URL}/carrito/${id}`, {
        method: "PUT", // actualizar recurso existente
        headers: {
          "Content-Type": "application/json", // indicamos que mandamos JSON
          Authorization: `Bearer ${usuario.token}`, // autenticación con token
        },
        body: JSON.stringify({ cantidad: nuevaCantidad }), // mandamos la nueva cantidad
      });
    } catch (error) {
      // 4️⃣ Si hay un error al hacer la petición al backend
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
