export const deCode = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    console.log(JSON.parse(jsonPayload).id);
    return JSON.parse(jsonPayload).id;
  } catch (err) {
    console.log(err);
    return;
  }
};
