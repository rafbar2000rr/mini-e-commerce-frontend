import { useContext, useEffect, useState } from "react"; 
import { CarritoContext } from "../context/CarritoContext"; 
import { Link } from "react-router-dom"; 
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; 
import "./Catalogo.css"; 

function Catalogo() {
  const [productos, setProductos] = useState([]); 
  const [error, setError] = useState(""); 
  const [page, setPage] = useState(1); 
  const [pages, setPages] = useState(1); 
  const [loading, setLoading] = useState(true); 
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(""); 
  const [categorias, setCategorias] = useState([]); 
  const [busqueda, setBusqueda] = useState(""); 

  const { agregarAlCarrito } = useContext(CarritoContext);
  const API_URL = import.meta.env.VITE_API_URL;

  // 🔹 Cargar categorías
  useEffect(() => {
    fetch(`${API_URL}/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setError("Error al cargar categorías"));
  }, []);

  // 🔹 Cargar productos
  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(
      `${API_URL}/productos?page=${page}&categoria=${categoriaSeleccionada}&search=${busqueda}`
    )
      .then((res) => res.json())
      .then((data) => {
        // ✅ Validar que productos sea un array
        setProductos(Array.isArray(data.productos) ? data.productos : []);
        // ✅ Validar que pages sea un número mayor a 0
        setPages(typeof data.pages === "number" && data.pages > 0 ? data.pages : 1);
      })
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, [page, categoriaSeleccionada, busqueda]);

  return (
    <div className="catalogo-exterior">
      <div className="catalogo">
        <h2>Catálogo de Productos</h2>

        {/* 🔍 Búsqueda */}
        <div className="filtros">
          <label htmlFor="buscar">Buscar producto:</label>
          <input
            id="buscar"
            type="text"
            placeholder="Escribe un nombre..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* 🏷️ Filtro por categoría */}
        <div className="filtros">
          <label htmlFor="categoria">Filtrar por categoría:</label>
          <select
            id="categoria"
            value={categoriaSeleccionada}
            onChange={(e) => {
              setCategoriaSeleccionada(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {Array.isArray(categorias) &&
              categorias.map((cat, i) => (
                <option key={i} value={cat._id}>{cat.nombre}</option>
              ))
            }
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="cargando">Cargando productos...</p>
        ) : (
          <>
            <div className="productos">
              {Array.isArray(productos) && productos.length > 0 ? (
                productos.map((producto) => (
                  <div key={producto._id} className="producto">
                    <Link to={`/producto/${producto._id}`}>
                      <img
                        src={`${API_URL}/uploads/${producto.imagen}`}
                        alt={producto.nombre}
                      />
                    </Link>
                    <h3>
                      <Link to={`/producto/${producto._id}`}>
                        {producto.nombre}
                      </Link>
                    </h3>
                    <p>{producto.descripcion}</p>
                    <p className={`stock ${producto.stock === 0 ? "agotado" : ""}`}>
                      {producto.stock > 0
                        ? `Stock disponible: ${producto.stock}`
                        : "Producto agotado"}
                    </p>
                    <div className="precio-boton">
                      <p className="precio">${producto.precio}</p>
                      <button
                        className="btn-carrito"
                        onClick={() => agregarAlCarrito(producto)}
                        disabled={producto.stock === 0}
                      >
                        {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay productos disponibles 😢</p>
              )}
            </div>

            {/* 📄 Paginación */}
            {pages > 1 && (
              <div className="paginacion">
                <button
                  disabled={page === 1}
                  style={{ color: page === 1 ? "gray" : "red", fontSize: "18px" }}
                  onClick={() => setPage(page - 1)}
                >
                  <FaArrowLeft />
                </button>

                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={page === i + 1 ? "activo" : ""}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page === pages}
                  style={{ color: page === pages ? "gray" : "red", fontSize: "18px" }}
                  onClick={() => setPage(page + 1)}
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Catalogo;
