import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/auth.store";

let socketInstance: Socket | null = null;
let activeSocketToken: string | null = null;
// `import.meta.env` must be written literally for Vite to substitute it.
const env = import.meta.env as Record<string, string | undefined>;
const defaultProductionSocketUrl = "https://master-pools-platform.onrender.com";

const isLocalDevHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const apiBase =
  typeof env.VITE_API_BASE_URL === "string" && env.VITE_API_BASE_URL.trim()
    ? env.VITE_API_BASE_URL.trim().replace(/\/$/, "")
    : isLocalDevHost
      ? ""
      : `${defaultProductionSocketUrl}/api`;
const derivedSocketUrl = /^https?:\/\//.test(apiBase)
  ? apiBase.replace(/\/api\/?$/, "")
  : "";
const socketUrl =
  (typeof env.VITE_SOCKET_URL === "string" && env.VITE_SOCKET_URL.trim()) ||
  derivedSocketUrl ||
  (isLocalDevHost ? "/" : defaultProductionSocketUrl);

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        activeSocketToken = null;
      }
      socketRef.current = null;
      return;
    }

    if (socketInstance && activeSocketToken !== token) {
      socketInstance.disconnect();
      socketInstance = null;
      activeSocketToken = null;
    }

    if (!socketInstance) {
      socketInstance = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });
      activeSocketToken = token;
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on component unmount — keep alive
    };
  }, [isAuthenticated, token]);

  return socketRef.current || socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    activeSocketToken = null;
  }
};
