import axios, { type AxiosError } from "axios";
import toast from "react-hot-toast";

/**
 * `import.meta.env` must appear literally — Vite only substitutes that exact
 * token at build time. Writing `(import.meta as any).env` compiles to a runtime
 * lookup that is always empty, which silently disables every VITE_* variable.
 */
const env = import.meta.env as Record<string, string | undefined>;
const defaultProductionApiBase =
  "https://master-pools-platform.onrender.com/api";

const isLocalDevHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const baseUrl =
  typeof env.VITE_API_BASE_URL === "string" && env.VITE_API_BASE_URL.trim()
    ? env.VITE_API_BASE_URL.trim().replace(/\/$/, "")
    : isLocalDevHost
      ? "/api"
      : defaultProductionApiBase;

const api = axios.create({
  baseURL: baseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message || err.message || "Request failed";

    if (status === 401) {
      localStorage.removeItem("mp_token");
      if (!window.location.pathname.includes("/login")) {
        toast.error("Your session expired. Sign in to continue.");
      }
    } else if (status === 403) {
      toast.error("Access denied");
    } else if (status === 429) {
      toast.error("Too many requests. Please wait a moment.");
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again.");
    }

    return Promise.reject(err);
  },
);

export default api;
