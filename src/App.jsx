import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import Navbar from '../src/components/Navbar';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import MisOrdenes from './pages/MisOrdenes';
import OrdenDetalle from './pages/OrdenDetalle';
import RutaPrivada from '../src/components/RutaPrivada';
import Login from './pages/Login';
import Registro from './pages/Registro';
import AdminLayout from '../src/components/productos/AdminLayout';
import PanelProductos from '../src/components/productos/PanelProductos';
import PanelPedidos from '../src/components/productos/PanelPedidos';
import DetalleProducto from './pages/DetalleProducto';
import Checkout from './pages/Checkout';
import RutaPublica from './components/RutaPublica';
import MiPerfil from './pages/MiPerfil';

function App() {
  return (
    <CarritoProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Redirigir la raíz al catálogo */}
          <Route path="/" element={<Navigate to="/catalogo" />} />

          {/* Página inicial accesible sin login */}
          <Route path="/catalogo" element={<Catalogo />} />

          {/* Login y Registro */}
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
          
          <Route path="/carrito" element={<Carrito />} />

          {/* Rutas protegidas */}
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
          <Route path="/producto/:id" element={<DetalleProducto />} />

          
          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
          <Route path="productos" element={<PanelProductos />} />
          <Route path="pedidos" element={<PanelPedidos />} />
          </Route>

        
        </Routes>
      </Router>
    </CarritoProvider>
  );
}

export default App;
