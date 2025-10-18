# 🛍️ Mini E-Commerce — Frontend  
**Autor:** Rafael Ibarra  

Este es el frontend del proyecto **Mini E-Commerce**, una tienda online desarrollada con **React** y **Vite**.  
El frontend se conecta con el backend (Node.js y Express) desplegado en **Railway** y ofrece una interfaz moderna, rápida y responsiva para explorar productos, gestionarlos y realizar compras simuladas mediante **PayPal Sandbox**.

## ✨ Características principales
- Diseño responsivo y moderno con **Tailwind CSS**.  
- Integración con API REST del backend.  
- Manejo de usuarios autenticados con **JWT**.  
- **Carrito de compras** persistente y sincronizado con el backend.  
- **Flujo de pago** completo con **PayPal Sandbox**.  
- Visualización de productos, detalles y actualización de stock.  
- Manejo de rutas y navegación dinámica con **React Router**.  

## ⚙️ Tecnologías utilizadas
- **React + Vite**  
- **Tailwind CSS**  
- **React Router DOM**  
- **Axios** para las peticiones HTTP  
- **PayPal JavaScript SDK** para los pagos  

## 🔗 Conexión al backend
El frontend se comunica con el backend desplegado en Railway.  
La URL del backend se configura mediante variables de entorno en el archivo `.env`:

```bash
VITE_API_URL=https://mini-e-commerce-backend-production.up.railway.app
