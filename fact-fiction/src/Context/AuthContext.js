import React, { createContext, useState, useEffect } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [username, setUsername] = useState(
    localStorage.getItem("username") || null
  );

  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const setLoginStatus = (loginStatus, userId, username, token) => {
    localStorage.setItem("isLoggedIn", loginStatus.toString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    setIsLoggedIn(loginStatus);
    setUserId(userId);
    setUsername(username);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserId(null);
    setUsername(null);
    setToken(null);
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserId(localStorage.getItem("userId"));
    setUsername(localStorage.getItem("username"));
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <LoginContext.Provider
      value={{ isLoggedIn, setLoginStatus, logout, userId, username, token }}
    >
      {children}
    </LoginContext.Provider>
  );
};
