import { useContext, useState } from "react";
import { LoginContext } from "../../Context/AuthContext";
import "./LogInComponent.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

const LogInComponent = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setLoginStatus } = useContext(LoginContext);

  const notifyError = (message) => {
    toast.error(`${message}, sorry!`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:3082/login", {
        email,
        password,
      });
      console.log(response.data);
      if (response.data) {
        const { user, token } = response.data;
        const userId = user._id;

        setLoginStatus(true, userId, token);
        localStorage.setItem("firstName", user.firstName);
        localStorage.setItem("lastName", user.lastName);

        navigate("/");
      } else {
        setLoginStatus(false, null, null);
        notifyError("Invalid email or password!");
      }
    } catch (error) {
      console.error("Error details:", error.response);
      console.error("Failed to fetch users", error);
      setLoginStatus(false, null, null);
      notifyError("Invalid email or password!");
    }
  };

  return (
    <div>
      <ToastContainer theme="light" />
      <button onClick={() => navigate("/")}>Back to Home</button>

      <div className="loginContainer">
        <div className="login">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input"
            />

            <button className="btn-login" onClick={handleLogin}>
              Login
            </button>
            <Link to="/register">Not a user? Register Here!</Link>
          </form>
          {/* <div>{error && <div error={error} isError={true}></div>}</div> */}
        </div>
      </div>
    </div>
  );
};
export default LogInComponent;
