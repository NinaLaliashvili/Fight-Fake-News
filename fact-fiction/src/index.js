import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter as Router } from "react-router-dom";
import { LoginProvider } from "./Context/AuthContext";
import { UserScoreProvider } from "./Context/UserScoreContext";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <LoginProvider>
      <UserScoreProvider>
        <App />
      </UserScoreProvider>
    </LoginProvider>
  </Router>
);
