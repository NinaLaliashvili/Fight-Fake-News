export const getUserFromStorage = () => {
  return localStorage.getItem("userId");
};

export const getIsLoggedInFromStorage = () => {
  return !!getUserFromStorage();
};

export const clearUserFromStorage = () => {
  localStorage.removeItem("userId");
};

export const setUserInStorage = (value) => {
  localStorage.setItem("userId", value);
};
