import { useContext } from "react"; // Hook para usar contextos
import { useNavigate } from "react-router-dom"; // Hook para navegar entre páginas
import { CarritoContext } from "../context/CarritoContext"; // Importamos el contexto del carrito
import "./Carrito.css"; // Estilos del carrito

//-------------------------------------------
// Muestra el carrito de compras
//-------------------------------------------
function Carrito() {
  // Extraemos del contexto las funciones y el estado del carrito
  const { carrito, eliminarDelCarrito, vaciarCarrito, actualizarCantidad } = useContext(CarritoContext);
  const navigate = useNavigate(); // Hook para redirigir a otras rutas

  // 🔹 Calcular el total sumando precio * cantidad de cada producto
  const total = carrito.reduce(
    (acc, producto) => acc + (producto.precio || 0) * (producto.cantidad || 1),
    0
  );

  const API_URL = import.meta.env.VITE_API_URL; // 🔹 URL de la API

  // 🔹 Función para obtener la URL correcta de la imagen
  const getImagen = (imagen) => {
    if (!imagen) return '/placeholder.png'; // placeholder si no hay imagen
    return imagen.startsWith('http') ? imagen : `${API_URL}/uploads/${imagen}`;
  };

  // 🔹 Función para ir al checkout
  const irAlCheckout = () => {
    if (carrito.length === 0) { // Si el carrito está vacío, mostramos alerta
      alert("Tu carrito está vacío 🛍️");
      return;
    }
    navigate("/checkout"); // Redirigimos a la página de checkout
  };

  return (
    <div className="carrito"> {/* Contenedor principal */}
      <h2>🛒 Tu Carrito</h2>

      {/* 🔹 Si el carrito está vacío */}
      {carrito.length === 0 ? (
        <p>Tu carrito está vacío 🛍️</p>
      ) : (
        <>
          {/* 🔹 Lista de productos en el carrito */}
          <ul>
            {carrito.map((producto, index) => (
              <li key={index} className="producto-carrito"> {/* Cada producto */}
                
                {/* 🔹 Imagen del producto */}
                <img
                  src={getImagen(producto.imagen)}
                  alt={producto.nombre}
                  width={80}
                  height={80}
                />

                <div>
                  {/* 🔹 Nombre del producto */}
                  <h4>{producto.nombre}</h4>

                  {/* 🔹 Precio del producto */}
                  <p>${producto.precio}</p>

                  {/* 🔹 Control de cantidad */}
                  <div className="cantidad-control">
                    <button onClick={() => actualizarCantidad(producto._id || producto.id, (producto.cantidad || 1) - 1)}>-</button>
                    <span>{producto.cantidad || 1}</span>
                    <button onClick={() => actualizarCantidad(producto._id || producto.id, (producto.cantidad || 1) + 1)}>+</button>
                  </div>
                </div>

                {/* 🔹 Botón para eliminar producto */}
                <button onClick={() => eliminarDelCarrito(producto._id || producto.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          {/* 🔹 Total del carrito */}
          <h3>Total: ${total.toFixed(2)}</h3>

          {/* 🔹 Botones de acciones del carrito */}
          <div className="acciones-carrito">
            {/* Botón para finalizar compra */}
            <button type="button" className="btn-finalizar" onClick={irAlCheckout}>
              Finalizar compra
            </button>

            {/* Botón para vaciar carrito */}
            <button type="button" className="btn-vaciar" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito;
