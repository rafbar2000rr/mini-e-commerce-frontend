import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CarritoContext } from "../context/CarritoContext";
import "./Carrito.css";

function Carrito() {
  const { carrito, eliminarDelCarrito, vaciarCarrito, actualizarCantidad } = useContext(CarritoContext);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // 🔹 Validar usuario logueado
  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (!userData) navigate("/login");
  }, []);

  const total = carrito.reduce((acc, producto) => acc + (producto.precio || 0) * (producto.cantidad || 1), 0);

  const getImagen = (imagen) => {
    if (!imagen) return '/placeholder.png';
    return imagen.startsWith('http') ? imagen : `${API_URL}/uploads/${imagen}`;
  };

  const irAlCheckout = () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío 🛍️");
      return;
    }
    navigate("/checkout");
  };

  const cambiarCantidad = (id, delta) => {
    const producto = carrito.find(p => p._id === id || p.id === id);
    if (!producto) return;
    const nuevaCantidad = Math.max(1, (producto.cantidad || 1) + delta);
    actualizarCantidad(id, nuevaCantidad);
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
                <img src={getImagen(producto.imagen)} alt={producto.nombre} width={80} height={80} />
                <div>
                  <h4>{producto.nombre}</h4>
                  <p>${producto.precio}</p>
                  <div className="cantidad-control">
                    <button onClick={() => cambiarCantidad(producto._id || producto.id, -1)}>-</button>
                    <span>{producto.cantidad || 1}</span>
                    <button onClick={() => cambiarCantidad(producto._id || producto.id, +1)}>+</button>
                  </div>
                </div>
                <button onClick={() => eliminarDelCarrito(producto._id || producto.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
          <h3>Total: ${total.toFixed(2)}</h3>
          <div className="acciones-carrito">
            <button type="button" className="btn-finalizar" onClick={irAlCheckout}>Finalizar compra</button>
            <button type="button" className="btn-vaciar" onClick={vaciarCarrito}>Vaciar carrito</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito;
