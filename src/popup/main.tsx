import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "./Popup";
import { sendAnnotationMessage } from "./chrome";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup onAnnotate={sendAnnotationMessage()} />
  </StrictMode>,
);
