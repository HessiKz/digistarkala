import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initThemeFromStorage } from "@/store/theme";
import "./styles/index.css";

initThemeFromStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
