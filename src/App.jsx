import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CarritoProvider } from "./context/CarritoContext";
import Navbar from "./components/Navbar";
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import MisOrdenes from "./pages/MisOrdenes";
import OrdenDetalle from "./pages/OrdenDetalle";
import RutaPrivada from "./components/RutaPrivada";
import RutaPublica from "./components/RutaPublica";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import MiPerfil from "./pages/MiPerfil";
import DetalleProducto from "./pages/DetalleProducto";
import Checkout from "./pages/Checkout";

// 🔹 Admin
import RutaAdmin from "./components/productos/RutaAdmin";
import AdminLayout from "./components/productos/AdminLayout";
import PanelProductos from "./components/productos/PanelProductos";
import PanelPedidos from "./components/productos/PanelPedidos";

function App() {
  return (
    <CarritoProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<Navigate to="/catalogo" />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />

          {/* Login / Registro */}
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

          {/* Rutas protegidas (usuarios logueados) */}
          <Route
            path="/carrito"
            element={
              <RutaPrivada>
                <Carrito />
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
            path="/mi-perfil"
            element={
              <RutaPrivada>
                <MiPerfil />
              </RutaPrivada>
            }
          />

          {/* 🔹 Rutas del Panel de Administración */}
          <Route
            path="/admin"
            element={
              <RutaAdmin>
                <AdminLayout />
              </RutaAdmin>
            }
          >
            {/* 👇 Subrutas anidadas dentro del layout */}
            <Route path="productos" element={<PanelProductos />} />
            <Route path="pedidos" element={<PanelPedidos />} />
          </Route>
        </Routes>
      </Router>
    </CarritoProvider>
  );
}

export default App;
