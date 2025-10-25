import { io } from "socket.io-client";

// -------------------------------------------------------------
// 🔹 Conectar con tu servidor Socket.io
// -------------------------------------------------------------
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🧩 Mostrar la URL que se está usando
console.log("🧩 SOCKET_URL:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // 🔹 Asegura conexión WebSocket
  autoConnect: true,         // 🔹 Conexión automática al importar
});

socket.on("connect", () => {
  console.log("✅ Conectado a Socket.io con ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("⚠️ Desconectado de Socket.io");
});
