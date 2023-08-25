import React, { createContext, useState, useEffect } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const setLoginStatus = (loginStatus, userId, token) => {
    localStorage.setItem("isLoggedIn", loginStatus.toString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("token", token);
    setIsLoggedIn(loginStatus);
    setUserId(userId);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserId(null);
    setToken(null);
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserId(localStorage.getItem("userId"));
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <LoginContext.Provider
      value={{ isLoggedIn, setLoginStatus, logout, userId, token }}
    >
      {children}
    </LoginContext.Provider>
  );
};
