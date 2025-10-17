import { useState, useContext, useEffect } from "react";
import { CarritoContext } from "../context/CarritoContext";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function Checkout() {
  const { carrito, setCarrito } = useContext(CarritoContext);

  const [cliente, setCliente] = useState({
    direccion: "",
    ciudad: "",
    codigoPostal: "",
  });

  const [usuario, setUsuario] = useState({ nombre: "", email: "" });
  const [error, setError] = useState("");

  // 🔹 Autocompletar usuario logueado
  useEffect(() => {
  const fetchUsuario = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Por favor inicia sesión antes de hacer una compra 💖");
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:5000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        // 🔹 Token expirado o inválido
        localStorage.removeItem("token");
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente 💖");
        window.location.href = "/login";
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setUsuario({ nombre: data.nombre, email: data.email });
      } else {
        console.warn("⚠️ No se pudo obtener el usuario.");
      }
    } catch (err) {
      console.error("❌ Error obteniendo usuario:", err);
      alert("Hubo un error al verificar tu sesión. Intenta más tarde 💕");
    }
  };

  fetchUsuario();
}, []);


  const handleChange = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  // 🔹 Total
  const total = carrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-pink-50 p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">Checkout 💖</h1>

      {/* Resumen del carrito */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-pink-500 mb-4">
          Resumen del carrito
        </h2>
        {carrito.length === 0 ? (
          <p className="text-gray-500">Tu carrito está vacío 😢</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {carrito.map((producto) => (
              <li
                key={producto.id || producto._id}
                className="flex justify-between"
              >
                <span>
                  {producto.nombre} x {producto.cantidad}
                </span>
                <span>${(producto.precio * producto.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-lg font-semibold text-pink-600">
          Total: ${total.toFixed(2)}
        </h3>
      </div>

      {/* Datos de envío */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-pink-500 mb-4">
          Datos de envío
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        <input
          type="text"
          value={usuario.nombre}
          readOnly
          className="w-full p-3 border border-pink-200 bg-gray-100 rounded-lg"
        />
        <input
          type="email"
          value={usuario.email}
          readOnly
          className="w-full p-3 border border-pink-200 bg-gray-100 rounded-lg"
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={cliente.direccion}
          onChange={handleChange}
          className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={cliente.ciudad}
          onChange={handleChange}
          className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <input
          type="text"
          name="codigoPostal"
          placeholder="Código postal"
          value={cliente.codigoPostal}
          onChange={handleChange}
          className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        {/* 🔹 Botón PayPal */}
        <PayPalButtons
  style={{ layout: "vertical" }}
  createOrder={async () => {
    try {
      // Transformar carrito para que cada producto tenga productoId y cantidad
      const productos = carrito.map(p => ({
        productoId: p._id || p.id,
        cantidad: p.cantidad,
      }));
      const res = await fetch("http://localhost:5000/paypal/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total,
          productos,
          datosCliente: { ...usuario, ...cliente },
        }),
      });

      const data = await res.json();
      return data.id; // 🔥 orderID que devuelve el backend
    } catch (err) {
      console.error("❌ Error creando orden:", err);
    }
  }}
  onApprove={async (data) => {
  try {
    const token = localStorage.getItem("token"); // ✅ Obtener token del usuario logueado

    const productos = carrito.map((p) => ({
      productoId: p._id || p.id,
      cantidad: p.cantidad,
    }));

    const res = await fetch(
      `http://localhost:5000/paypal/api/capture-order/${data.orderID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Enviar token al backend
        },
        body: JSON.stringify({
          productos,
          datosCliente: { ...usuario, ...cliente },
        }),
      }
    );

    const capture = await res.json();

    if (!res.ok) {
      const mensaje =
        capture.detalle || capture.error || "Error al procesar la compra";
      setError(mensaje);
      alert("❌ " + mensaje);
      return;
    }

    console.log("✅ Pago exitoso:", capture);

    // ✅ Vaciar carrito en frontend
    setCarrito([]);
    localStorage.removeItem("carrito");

    // ✅ Mensaje y redirección
    alert("Pago completado con PayPal 💖 Tu pedido ha sido registrado.");
    window.location.href = "/mis-ordenes";
  } catch (err) {
    console.error("❌ Error capturando pago:", err);
    setError("Error al conectar con el servidor. Intenta nuevamente.");
  }
}}

/>

      </div>
    </div>
  );
}





// // src/pages/Checkout.jsx
// import { useState, useContext, useEffect } from "react"; // Hooks de React
// import { CarritoContext } from "../context/CarritoContext"; // Contexto del carrito

// //----------------------------------------------------------------------------
// //Acá el cliente confirma qué productos quiere, proporciona sus datos y paga.
// //----------------------------------------------------------------------------
// export default function Checkout() {
//   const { carrito, setCarrito } = useContext(CarritoContext); // Accedemos al carrito y a la función para modificarlo

//   const [cliente, setCliente] = useState({
//     direccion: "",
//     ciudad: "",
//     codigoPostal: "",
//   }); // Estado para datos de envío

//   const [usuario, setUsuario] = useState({ nombre: "", email: "" }); // ✅ Datos del usuario logueado (autocompletados desde BD)

//   const [mensajeExito, setMensajeExito] = useState(""); // Estado para mensaje de éxito
//   const [error, setError] = useState(""); // Estado para errores
//   const [loading, setLoading] = useState(false); // Estado para loading/spinner
  
  
//   // 🔹 Autocompletar datos del usuario al montar el componente
//   useEffect(() => {
//     const fetchUsuario = async () => {
//       try {
//         const token = localStorage.getItem("token"); // Obtenemos token guardado
//         if (!token) return;

//         const res = await fetch("http://localhost:5000/me", {
//           headers: { Authorization: `Bearer ${token}` }, // Enviamos token al backend
//         });

//         if (res.ok) {
//           const data = await res.json();
//           setUsuario({ nombre: data.nombre, email: data.email }); // Guardamos datos del usuario
//         }
//       } catch (error) {
//         console.error("❌ Error obteniendo usuario:", error);
//       }
//     };
//     fetchUsuario();
//   }, []);

//   //----------------------------------------------------------------------------------------
//   // 🔹 Manejar cambios en los inputs de dirección
//   const handleChange = (e) => {
//     setCliente({
//       ...cliente,
//       [e.target.name]: e.target.value, // Actualiza solo el campo editado
//     });
//   };
  
//   //------------------------------------------------------------------------------------------
//   // 🔹 Calcular total del carrito
//   const total = carrito.reduce(
//     (acc, producto) => acc + producto.precio * producto.cantidad,
//     0
//   );
//   //-------------------------------------------------------------------------------------------
//   // 🔹 Procesar pago
//   const handlePagar = async (e) => {
//     e.preventDefault();
//     setError("");
//   // Validar que todos los campos de envío estén completos
//     for (let campo in cliente) {
//       if (!cliente[campo]) {
//         setError("Por favor completa todos los campos de envío");
//         return;
//       }
//     }
//       if (carrito.length === 0) { // Validar carrito vacío
//       setError("Tu carrito está vacío");
//       return;
//     }
//     setLoading(true); // Activar loading
//     const token = localStorage.getItem("token");

//     // 🔹 Extraer productos con id y cantidad
//     const productos = carrito.map((producto) => ({
//       productoId: producto._id || producto.id,
//       cantidad: producto.cantidad || 1,
//     }));

//     // ✅ Combinar datos del usuario con dirección de envío
//     const datosCliente = {
//       nombre: usuario.nombre,
//       email: usuario.email,
//       ...cliente,
//     };

//     try {
//       const res = await fetch("http://localhost:5000/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`, // Se requiere token para crear orden
//         },
//         body: JSON.stringify({ productos, datosCliente }), // Enviamos carrito + datos cliente
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setCarrito([]); // Vaciar carrito tras compra
//         setMensajeExito(
//           `¡Compra realizada con éxito, ${usuario.nombre}! Total: $${total.toFixed(
//             2
//           )}`
//         );
//       } else {
//         setError(data.detalle || data.error || "Error al procesar la orden");
//       }
//     } catch (err) {
//       console.error("❌ Error de conexión:", err);
//       setError("Error de conexión con el servidor");
//     } finally {
//       setLoading(false); // Apagar loading
//     }
//   };

//   // 🔹 Vista si la compra fue exitosa
//   if (mensajeExito) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-6">
//         <h2 className="text-2xl font-bold text-pink-600 mb-4">{mensajeExito}</h2>
//         <p className="text-pink-700 text-lg">
//           Gracias por tu pedido, pronto lo recibirás 💖
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center min-h-screen bg-pink-50 p-6">
//       <h1 className="text-3xl font-bold text-pink-600 mb-6">Checkout 💖</h1>

//       {/* 🔹 Resumen del carrito */}
//       <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 mb-6">
//         <h2 className="text-xl font-semibold text-pink-500 mb-4">
//           Resumen del carrito
//         </h2>
//         {carrito.length === 0 ? ( // Si el carrito está vacío
//           <p className="text-gray-500">Tu carrito está vacío 😢</p>
//         ) : (
//           <ul className="space-y-2 mb-4">
//             {carrito.map((producto) => (
//               <li key={producto.id || producto._id} className="flex justify-between">
//                 <span>
//                   {producto.nombre} x {producto.cantidad}
//                 </span>
//                 <span>
//                   ${(producto.precio * producto.cantidad).toFixed(2)}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         )}
//         <h3 className="text-lg font-semibold text-pink-600">
//           Total: ${total.toFixed(2)}
//         </h3>
//       </div>

//       {/* 🔹 Formulario de datos */}
//       <form
//         onSubmit={handlePagar}
//         className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4"
//       >
//         <h2 className="text-xl font-semibold text-pink-500 mb-4">
//           Datos de envío
//         </h2>

//         {error && <p className="text-red-500">{error}</p>} {/* Mostrar errores */}

//         {/* ✅ Nombre y Email autocompletados y bloqueados */}
//         <input
//           type="text"
//           value={usuario.nombre}
//           readOnly
//           className="w-full p-3 border border-pink-200 bg-gray-100 rounded-lg"
//         />
//         <input
//           type="email"
//           value={usuario.email}
//           readOnly
//           className="w-full p-3 border border-pink-200 bg-gray-100 rounded-lg"
//         />

//         {/* Campos de dirección */}
//         <input
//           type="text"
//           name="direccion"
//           placeholder="Dirección"
//           value={cliente.direccion}
//           onChange={handleChange}
//           className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
//         />
//         <input
//           type="text"
//           name="ciudad"
//           placeholder="Ciudad"
//           value={cliente.ciudad}
//           onChange={handleChange}
//           className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
//         />
//         <input
//           type="text"
//           name="codigoPostal"
//           placeholder="Código postal"
//           value={cliente.codigoPostal}
//           onChange={handleChange}
//           className="w-full p-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
//         />

//         {/* Botón de pagar */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-pink-500 text-white font-bold py-3 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
//         >
//           {loading ? "Procesando..." : "Pagar 💳"}
//         </button>
//       </form>
//     </div>
//   );
// }
