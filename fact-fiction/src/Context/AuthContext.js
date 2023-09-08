import React, { createContext, useState, useEffect } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [username, setUsername] = useState(
    localStorage.getItem("username") || null
  );

  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const setLoginStatus = (
    loginStatus,
    userId,
    username,
    token,
    userAvatar = ""
  ) => {
    localStorage.setItem("isLoggedIn", loginStatus.toString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    localStorage.setItem("avatar", userAvatar);
    setAvatar(userAvatar);
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
    localStorage.removeItem("avatar");
    setAvatar("");
    setIsLoggedIn(false);
    setUserId(null);
    setUsername(null);
    setToken(null);
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    const fetchedUserId = localStorage.getItem("userId");
    setUserId(fetchedUserId);
    setUsername(localStorage.getItem("username"));
    setToken(localStorage.getItem("token"));
    setAvatar(localStorage.getItem("avatar"));
    if (fetchedUserId) {
      
      fetch(`http://localhost:3082/user/${fetchedUserId}`)
        .then(response => response.json())
        .then(data => {
          
          if (data && data.avatar) {
            setAvatar(data.avatar);
            localStorage.setItem("avatar", data.avatar);
          }
        })
        .catch(error => {
          console.error("There was an error fetching the user details:", error);
        });
      }

  }, []);

  return (
    <LoginContext.Provider
      value={{
        isLoggedIn,
        setLoginStatus,
        logout,
        userId,
        username,
        token,
        avatar,
        setAvatar,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
