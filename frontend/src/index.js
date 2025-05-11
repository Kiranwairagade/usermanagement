import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionProvider } from "./contexts/PermissionContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <App />
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
