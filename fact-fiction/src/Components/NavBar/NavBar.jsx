import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useContext(LoginContext);

  const pageName = {
    "/login": "Log In",
    "/register": "Register",
    "/admin": "Admin",
    "/leaderboard": "Leaderboard",
    "/quiz": "Quiz Page",
    "/results": "Results",
    "/submit-fact": "Fact Submission",
  };

  const currentPageName = pageName[location.pathname] || "";

   const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    navigate("/");
  };

  return (
    <header className="header">
      <img
        className="brand-logo"
        src="https://cdn.factcheck.org/UploadedFiles/rwjf-icon-conspiracy-01-.png"
        height="50"
        alt="logo"
      />
      <div className="page-name">{currentPageName}</div>
      <nav className="nav">
        {isLoggedIn ? (
          <>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")}>Log In</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </>
        )}
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/admin")}>Admin</button>
        <button onClick={() => navigate("/leaderboard")}>Leaderboard</button>
        <button onClick={() => navigate("/quiz")}>Quiz Page</button>
        <button onClick={() => navigate("/results")}>Results</button>
        <button onClick={() => navigate("/submit-fact")}>
          Fact Submission
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
