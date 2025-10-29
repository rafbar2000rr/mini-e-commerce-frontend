import { Routes, Route } from "react-router-dom";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import AdminPedidos from "./admin/AdminPedidos";
import AdminProductos from "./admin/AdminProductos";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <Navbar />

        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Catalogo />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas para usuarios logueados */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          {/* Rutas exclusivas para admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
            <Route path="/admin/productos" element={<AdminProductos />} />
          </Route>
        </Routes>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
