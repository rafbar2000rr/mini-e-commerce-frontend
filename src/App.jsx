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
              
                <Carrito />
              
            }
          />
          <Route
            path="/checkout"
            element={
              
                <Checkout />
              
            }
          />

          {/* ----------------------------- */}
          {/* 🧑‍💼 RUTAS SOLO PARA ADMIN */}
          {/* ----------------------------- */}
          <Route
            path="/admin/pedidos"
            element={
              
                <AdminPedidos />
              
            }
          />
          <Route
            path="/admin/productos"
            element={
              
                <AdminProductos />
              
            }
          />
        </Routes>
      </CarritoProvider>
    
  );
}

export default App;
