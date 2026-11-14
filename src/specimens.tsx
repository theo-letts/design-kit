import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Viewer from "./Viewer";
import "./index.css";
import { installSelfHostedFaces } from "./lib/fonts";

// The faces this project ships, declared before the first paint.
installSelfHostedFaces();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Viewer />
  </StrictMode>,
);
