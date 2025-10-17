// ✅ Importamos StrictMode para activar comprobaciones adicionales en desarrollo
import { StrictMode } from 'react';

// ✅ createRoot es la nueva forma de renderizar apps en React 18+
import { createRoot } from 'react-dom/client';

// ✅ Importamos los estilos globales
import './index.css';

// ✅ Importamos PayPal
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// ✅ Componente principal de la aplicación
import App from './App.jsx';

// ✅ Buscamos el elemento "root" en el HTML donde se montará la app
const rootElement = document.getElementById('root');

// ✅ Creamos la raíz de React vinculada al div#root
const root = createRoot(rootElement);

// ✅ Renderizamos la aplicación dentro de <StrictMode> para detectar problemas potenciales
root.render(
  
    <PayPalScriptProvider
      options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}
    >
      <App />
    </PayPalScriptProvider>
  
);
