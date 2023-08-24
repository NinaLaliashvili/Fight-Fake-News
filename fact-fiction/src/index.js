import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);
