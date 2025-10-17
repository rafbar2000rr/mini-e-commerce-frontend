import { useContext } from "react"; // Hook para usar contextos
import { useNavigate } from "react-router-dom"; // Hook para navegar entre páginas
import { CarritoContext } from "../context/CarritoContext"; // Importamos el contexto del carrito
import "./Carrito.css"; // Estilos del carrito

//-------------------------------
//Muestra el carrito de compras
//-------------------------------
function Carrito() {
  // Extraemos del contexto las funciones y el estado del carrito
  const { carrito, eliminarDelCarrito, vaciarCarrito, actualizarCantidad } = useContext(CarritoContext);
  const navigate = useNavigate(); // Hook para redirigir a otras rutas

  // 🔹 Calcular el total sumando precio * cantidad de cada producto
  const total = carrito.reduce(
    (acc, producto) => acc + (producto.precio || 0) * (producto.cantidad || 1),
    0
  );

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

      {carrito.length === 0 ? ( // Si no hay productos en el carrito
        <p>Tu carrito está vacío 🛍️</p>
      ) : (
        <>
          <ul> {/* Lista de productos en el carrito */}
            {carrito.map((producto, index) => (
              <li key={index} className="producto-carrito"> {/* Cada producto */}
                <img
                  src={`http://localhost:5000/uploads/${producto.imagen}`}
                  alt={producto.nombre}
                  width={80}
                  height={80}
                />
                <div>
                  <h4>{producto.nombre}</h4>
                  <p>
                    ${producto.precio} x {producto.cantidad || 1}
                  </p>
                  <div className="cantidad-control">
                    <button onClick={() => actualizarCantidad(producto._id || producto.id, (producto.cantidad || 1) - 1)}>-</button>
                    <span>{producto.cantidad || 1}</span>
                    <button onClick={() => actualizarCantidad(producto._id || producto.id, (producto.cantidad || 1) + 1)}>+</button>
                  </div>
                </div>
                <button onClick={() => eliminarDelCarrito(producto._id || producto.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <h3>Total: ${total.toFixed(2)}</h3>

          {/* 🔹 Botones con más espacio entre sí */}
          <div className="acciones-carrito">
            <button type="button" className="btn-finalizar" onClick={irAlCheckout}>
              Finalizar compra
            </button>
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
