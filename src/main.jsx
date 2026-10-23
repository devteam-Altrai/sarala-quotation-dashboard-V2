import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { store } from "../src/redux/Index.js";
import { Provider } from "react-redux";
import { FileWebSocketProvider } from "./context/webSocketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <FileWebSocketProvider>
          <App />
        </FileWebSocketProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
