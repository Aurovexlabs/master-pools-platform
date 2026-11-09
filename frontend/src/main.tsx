import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const isProduction = Boolean(
  (import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD,
);

if ("serviceWorker" in navigator && isProduction) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}

const rootElement = document.getElementById("root")!;

/**
 * If the very first render throws there is no route boundary to catch it, and
 * React leaves the document empty. Paint an explanation the engineer can act
 * on rather than a blank white page.
 */
const renderFallback = (error: unknown) => {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#fff;font-family:'DM Sans',system-ui,sans-serif;color:#0b1220">
      <div style="max-width:520px">
        <h1 style="font-family:'Cabinet Grotesk','DM Sans',sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.028em;margin:0 0 8px">The application could not start</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569">Reload the page. If it keeps failing, the browser console holds the full trace.</p>
        <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;font-size:12px;color:#334155;overflow:auto;max-height:200px">${message.replace(
          /[<>&]/g,
          (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[char] ?? char,
        )}</pre>
        <button onclick="window.location.reload()" style="margin-top:18px;height:42px;padding:0 18px;border:0;border-radius:8px;background:#0284c7;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Reload</button>
      </div>
    </div>`;
};

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  console.error("App render error:", err);
  renderFallback(err);
}
