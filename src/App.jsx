// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CarritoProvider } from "./context/CarritoContext";
import Navbar from "./components/Navbar";

// 🛍️ Páginas del usuario
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import MisOrdenes from "./pages/MisOrdenes";
import OrdenDetalle from "./pages/OrdenDetalle";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import MiPerfil from "./pages/MiPerfil";
import Checkout from "./pages/Checkout";
import DetalleProducto from "./pages/DetalleProducto";

// 🔒 Rutas protegidas
import RutaPrivada from "./components/RutaPrivada";
import RutaPublica from "./components/RutaPublica";
import RutaAdmin from "./components/RutaAdmin";

// ⚙️ Panel de administración
import AdminLayout from "./components/productos/AdminLayout";
import PanelProductos from "./components/productos/PanelProductos";
import PanelPedidos from "./components/productos/PanelPedidos";

function App() {
  return (
    <CarritoProvider>
      <Router>
        <Navbar />

        <Routes>
          {/* 🏠 Redirigir raíz al catálogo */}
          <Route path="/" element={<Navigate to="/catalogo" />} />

          {/* 🛍️ Página inicial accesible sin login */}
          <Route path="/catalogo" element={<Catalogo />} />

          {/* 🔓 Rutas públicas (login y registro) */}
          <Route
            path="/login"
            element={
              <RutaPublica>
                <Login />
              </RutaPublica>
            }
          />
          <Route
            path="/registro"
            element={
              <RutaPublica>
                <Registro />
              </RutaPublica>
            }
          />

          {/* 🛒 Carrito accesible para todos */}
          <Route path="/carrito" element={<Carrito />} />

          {/* 🔐 Rutas protegidas (usuario logueado) */}
          <Route
            path="/mis-ordenes"
            element={
              <RutaPrivada>
                <MisOrdenes />
              </RutaPrivada>
            }
          />
          <Route
            path="/mis-ordenes/:id"
            element={
              <RutaPrivada>
                <OrdenDetalle />
              </RutaPrivada>
            }
          />
          <Route
            path="/checkout"
            element={
              <RutaPrivada>
                <Checkout />
              </RutaPrivada>
            }
          />
          <Route
            path="/mi-perfil"
            element={
              <RutaPrivada>
                <MiPerfil />
              </RutaPrivada>
            }
          />

          {/* 🧴 Detalle del producto (accesible sin login) */}
          <Route path="/producto/:id" element={<DetalleProducto />} />

          {/* 👑 Panel de administración protegido */}
          <Route
            path="/admin/*"
            element={
              <RutaAdmin>
                <AdminLayout />
              </RutaAdmin>
            }
          >
            {/* Subrutas internas del admin */}
            <Route path="productos" element={<PanelProductos />} />
            <Route path="pedidos" element={<PanelPedidos />} />
          </Route>
        </Routes>
      </Router>
    </CarritoProvider>
  );
}

export default App;
