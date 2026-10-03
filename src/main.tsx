import "@/shared/lib/zodConfig";
import "@/shared/i18n/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { startStaleChunkReload } from "@/app/staleChunkReload";
import "@/app/index.css";
import { startSessionSync } from "@/shared/session/logout";
import { startThemeSync } from "@/shared/theme/theme";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

startThemeSync();
startSessionSync();
startStaleChunkReload();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
