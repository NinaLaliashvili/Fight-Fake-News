import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getIsLoggedInFromStorage,
  getUserFromStorage,
  setUserInStorage,
  clearUserFromStorage,
} from "../helpers/storage";
import { deCode } from "../helpers/deCode";

export const authContext = createContext({});

const Provider = authContext.Provider;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedInFromStorage());

  const [userInfo, setUserInfo] = useState({});

  const userJwtToken = getUserFromStorage();
  const userId = deCode(userJwtToken);

  const logUserIn = (userId) => {
    setIsLoggedIn(true);
    setUserInStorage(userId);

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const logUserOut = () => {
    setIsLoggedIn(false);
    clearUserFromStorage();
    navigate("/");
  };
  const value = {
    logUserIn,
    logUserOut,
    userJwtToken,
    userId,
    isLoggedIn,
    setIsLoggedIn,
    userInfo,
    setUserInfo,
  };
  return <Provider value={value}>{children}</Provider>;
};
