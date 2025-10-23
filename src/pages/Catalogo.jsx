import { useContext, useEffect, useState } from "react"; 
import { CarritoContext } from "../context/CarritoContext"; 
import { Link } from "react-router-dom"; 
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; 

function Catalogo() {
  const [productos, setProductos] = useState([]); 
  const [error, setError] = useState(""); 
  const [page, setPage] = useState(1); 
  const [pages, setPages] = useState(1); 
  const [loading, setLoading] = useState(true); 
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(""); 
  const [categorias, setCategorias] = useState([]); 
  const [busqueda, setBusqueda] = useState(""); 
  const [mensajeCarrito, setMensajeCarrito] = useState("");

  const { agregarAlCarrito } = useContext(CarritoContext);
  const API_URL = import.meta.env.VITE_API_URL || "";

  // 🔹 Cargar categorías
  useEffect(() => {
    fetch(`${API_URL}api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setError("Error al cargar categorías"));
  }, [API_URL]);

  // 🔹 Cargar productos
  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(
      `${API_URL}/api/catalogo?page=${page}&categoria=${categoriaSeleccionada}&search=${busqueda}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProductos(Array.isArray(data.productos) ? data.productos : []);
        setPages(typeof data.pages === "number" && data.pages > 0 ? data.pages : 1);
      })
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, [page, categoriaSeleccionada, busqueda, API_URL]);

  const handleAgregarAlCarrito = (producto) => {
    agregarAlCarrito(producto);
    setMensajeCarrito(`${producto.nombre} agregado al carrito!`);
    setTimeout(() => setMensajeCarrito(""), 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Catálogo de Productos
        </h2>

        {mensajeCarrito && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {mensajeCarrito}
          </div>
        )}

        {/* 🔍 Búsqueda y filtro */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <div className="flex flex-col">
            <label htmlFor="buscar" className="text-sm text-gray-700 mb-1">
              Buscar producto:
            </label>
            <input
              id="buscar"
              type="text"
              placeholder="Escribe un nombre..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="categoria" className="text-sm text-gray-700 mb-1">
              Filtrar por categoría:
            </label>
            <select
              id="categoria"
              value={categoriaSeleccionada}
              onChange={(e) => { setCategoriaSeleccionada(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}
        {loading ? (
          <p className="text-gray-600 text-center">Cargando productos...</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {productos.length > 0 ? (
                productos.map((producto) => (
                  <div
                    key={producto._id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm transform transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:scale-[1.02] flex flex-col h-full overflow-hidden"
                  >
                    <Link
                      to={`/producto/${producto._id}`}
                      className="block w-full h-56 overflow-hidden rounded-t-2xl"
                    >
                      <img
                        src={`${API_URL.replace('/api','')}/uploads/${producto.imagen}`}
                        alt={producto.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </Link>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate mb-1" title={producto.nombre}>
                        {producto.nombre}
                      </h3>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-4 transition-all duration-300 group-hover:line-clamp-none">
                        {producto.descripcion}
                      </p>

                      <p className={`text-sm font-medium ${producto.stock === 0 ? "text-red-500" : "text-green-600"} mb-2`}>
                        {producto.stock > 0 ? `Stock disponible: ${producto.stock}` : "Producto agotado"}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-purple-600 font-semibold text-base">
                          ${producto.precio.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleAgregarAlCarrito(producto)}
                          disabled={producto.stock === 0}
                          className={`px-3 py-2 text-sm rounded-xl font-medium transition-colors duration-200 ${
                            producto.stock === 0
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          }`}
                        >
                          {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center col-span-full">No hay productos disponibles 😢</p>
              )}
            </div>

            {pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className={`p-2 rounded-full ${page === 1 ? "text-gray-400 cursor-not-allowed" : "text-purple-600 hover:bg-purple-100"}`}
                >
                  <FaArrowLeft />
                </button>

                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium ${page === i + 1 ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className={`p-2 rounded-full ${page === pages ? "text-gray-400 cursor-not-allowed" : "text-purple-600 hover:bg-purple-100"}`}
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
