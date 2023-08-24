import { useContext, useState } from "react";
import { authContext } from "../../Context/AuthContext";
import "./LogInComponent.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import axios from "axios";

const LogInComponent = () => {
  const navigate = useNavigate();
  const { logUserIn, setUserInfo } = useContext(authContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const notifyError = (message) => {
    toast.error(`${message}, sorry!`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleLogIn = () => {
    if (email && password) {
      axios
        .post(process.env.REACT_APP_API_PORT + "login", {
          email,
          password,
        })
        .then((resp) => {
          console.log("made it to response");
          const userObject = resp.data.user;
          const { token, user } = userObject;
          setUserInfo(user);
          //getting user and token from server

          logUserIn(token);
        })
        .catch((err) => {
          console.log(err);
          setError(true);
          setErrorMessage(err);
          notifyError(errorMessage);
        });
    } else {
      setError(true);
      notifyError(
        "must enter values for email and password; c'mon, you know the drill!"
      );
    }
  };
  return (
    <div>
      <ToastContainer theme="light" />
      <button onClick={() => navigate("/")}>Back to Home</button>

      <div className="loginContainer">
        <div className="login">
          <h1>Login</h1>

          <input
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email"
            className="input"
          />
          <input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            className="input"
          />

          <button onClick={handleLogIn}>Login</button>
          <Link to="/register">Not a user? Register Here!</Link>

          {/* <div>{error && <div error={error} isError={true}></div>}</div> */}
        </div>
      </div>
    </div>
  );
};
export default LogInComponent;
