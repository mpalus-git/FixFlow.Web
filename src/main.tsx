import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/app/index.css";
import "@/shared/i18n/i18n";
import { startThemeSync } from "@/shared/theme/theme";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

startThemeSync();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
