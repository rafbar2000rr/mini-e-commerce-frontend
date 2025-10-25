import { io } from "socket.io-client";

// -------------------------------------------------------------
// 🔹 Conectar con tu servidor Socket.io
// -------------------------------------------------------------
// Reemplaza con la URL de tu backend en Railway o donde tengas tu servidor
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
