import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";
import Modal from "./Modal";
import "./NavBar.css";
import { Icon } from "../Icon/Icon";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setLoginStatus, username } = useContext(LoginContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const pageName = {
    "/login": "Log In",
    "/register": "Register",
    "/admin": "Admin",
    "/leaderboard": "Leaderboard",
    "/quiz": "Quiz Page",
    "/results": "Results",
    "/submit-fact": "Fact Submission",
    "/usersetting": "User Setting",
  };

  const currentPageName = pageName[location.pathname] || "";

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    setLoginStatus(false, null, null);
    navigate("/");
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="header">
        <img
          className="brand-logo"
          src="https://cdn.factcheck.org/UploadedFiles/rwjf-icon-conspiracy-01-.png"
          height="50"
          alt="logo"
        />
        <div className="page-name">{currentPageName}</div>
        <nav className="nav">
          
        <button onClick={() => navigate("/")}>Home</button>
          {isLoggedIn ? (
            <>
              
              <button onClick={() => navigate("/usersetting")}>
                {username}
              </button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Log In</button>
              <button onClick={() => navigate("/register")}>Register</button>
            </>
          )}
          <button onClick={() => navigate("/admin")}>Admin</button>
          <button onClick={() => navigate("/gamemodel")}>Quiz Page</button>

          <button onClick={() => setShowDropdown(!showDropdown)}>
            <Icon i="menu" />
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/results")}>Results</button>

              <button onClick={() => navigate("/leaderboard")}>
                Leaderboard
              </button>
              <button onClick={() => navigate("/submit-fact")}>
                Fact Submission
              </button>
            </div>
          )}
        </nav>
      </header>
      <Modal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Navbar;
