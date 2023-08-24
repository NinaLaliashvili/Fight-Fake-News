import { useContext, useState } from "react";
import { authContext } from "../../Context/AuthContext";
import "./LogInComponent.css";
import { Link, useNavigate } from "react-router-dom";

const LogInComponent = () => {
  const navigate = useNavigate();
  const { logUserIn } = useContext(authContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogIn = () => {
    //post email and password
    //localStorage("LogInUser") (?)
    //logUserIn(resp.data)
    //catch
  };
  return (
    <div>
      <button onClick={() => navigate("/")}>Back to Home</button>

      <div className="loginContainer">
        <div className="login">
          <h1>Login</h1>

          <input
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email"
          />
          <input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
          />

          <button onClick={handleLogIn}>Login</button>
          <Link to="/register">Not a user? register</Link>
          <div>{error && <div error={error} isError={true}></div>}</div>
        </div>
      </div>
    </div>
  );
};
export default LogInComponent;
