import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";
import "./Carrito.css";

//-------------------------------------------
// 🛍️ Carrito de compras
//-------------------------------------------
function Carrito() {
  const { carrito, eliminarDelCarrito, vaciarCarrito, actualizarCantidad } =
    useContext(CarritoContext);
  const navigate = useNavigate();

  // 🔹 Calcular total
  const total = carrito.reduce(
    (acc, producto) => acc + (producto.precio || 0) * (producto.cantidad || 1),
    0
  );

  const API_URL = import.meta.env.VITE_API_URL;

  // 🔹 Imagen segura
  const getImagen = (imagen) => {
    if (!imagen) return "/placeholder.png";
    return imagen.startsWith("http") ? imagen : `${API_URL}/uploads/${imagen}`;
  };

  // 🔹 Ir al checkout
  const irAlCheckout = () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío 🛍️");
      return;
    }

    // 🔐 Verificar si el usuario está logueado
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Por favor inicia sesión para finalizar tu compra 💖");
       localStorage.setItem("rutaDestino", "/checkout"); // 💾 Guardamos la ruta
      navigate("/login");
      return;
    }

    // ✅ Si está logueado, continuar al checkout
    navigate("/checkout");
  };

  return (
    <div className="carrito">
      <h2>🛒 Tu Carrito</h2>

      {carrito.length === 0 ? (
        <p>Tu carrito está vacío 🛍️</p>
      ) : (
        <>
          <ul>
            {carrito.map((producto, index) => (
              <li key={index} className="producto-carrito">
                {/* Imagen */}
                <img
                  src={getImagen(producto.imagen)}
                  alt={producto.nombre}
                  width={80}
                  height={80}
                />

                <div className="info-producto">
                  <h4>{producto.nombre}</h4>
                  <p>${producto.precio}</p>

                  {/* 🔹 Control de cantidad + eliminar en la misma fila */}
                  <div className="acciones-producto">
                    <div className="cantidad-control">
                      <button
                        onClick={() =>
                          actualizarCantidad(
                            producto._id || producto.id,
                            (producto.cantidad || 1) - 1
                          )
                        }
                      >
                        -
                      </button>
                      <span>{producto.cantidad || 1}</span>
                      <button
                        onClick={() =>
                          actualizarCantidad(
                            producto._id || producto.id,
                            (producto.cantidad || 1) + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="btn-eliminar"
                      onClick={() =>
                        eliminarDelCarrito(producto._id || producto.id)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <h3>Total: ${total.toFixed(2)}</h3>

          <div className="acciones-carrito">
            <button
              type="button"
              className="btn-finalizar"
              onClick={irAlCheckout}
            >
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
