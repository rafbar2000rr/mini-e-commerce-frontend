// src/components/productos/ProductoCard.jsx
export default function ProductoCard({ producto }) {
  return (
    <div className="border rounded p-4 shadow">
      <img src={producto.imagenes} alt={producto.nombre} className="w-full h-40 object-cover mb-2" />
      <h3 className="text-lg font-semibold">{producto.nombre}</h3>
      <p className="text-gray-600">S/. {producto.precio}</p>
    </div>
  );
}
