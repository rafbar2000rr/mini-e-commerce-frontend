//=========================================
// App.jsx
// Configura las rutas del sitio y aplica
// protección según el tipo de usuario
//=========================================

import { Routes, Route } from "react-router-dom";

// ✅ Contextos globales
import { CarritoProvider } from "./context/CarritoContext";

// ✅ Componentes principales
import Navbar from "./components/Navbar";
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";

// ✅ Páginas de administrador
import AdminPedidos from "./admin/AdminPedidos";
import AdminProductos from "./admin/AdminProductos";

// ✅ Ruta protegida universal
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    //-----------------------------------------------
    // 🌍 Contextos globales que envuelven toda la app
    //-----------------------------------------------
    <AuthProvider>
      <CarritoProvider>
        <Navbar />

        <Routes>
          {/* ------------------- */}
          {/* 🌐 RUTAS PÚBLICAS */}
          {/* ------------------- */}
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />

          {/* ----------------------------- */}
          {/* 🛒 RUTAS PARA USUARIOS LOGUEADOS */}
          {/* ----------------------------- */}
          <Route
            path="/carrito"
            element={
              <ProtectedRoute>
                <Carrito />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* ----------------------------- */}
          {/* 🧑‍💼 RUTAS SOLO PARA ADMIN */}
          {/* ----------------------------- */}
          <Route
            path="/admin/pedidos"
            element={
              <ProtectedRoute adminOnly>
                <AdminPedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute adminOnly>
                <AdminProductos />
              </ProtectedRoute>
            }
          />
        </Routes>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
