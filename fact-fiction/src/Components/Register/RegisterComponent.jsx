import { useState } from "react";
import "./RegisterComponent.css";
import { Link, useNavigate } from "react-router-dom";

const RegisterComponent = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    //post name, email, phone, password and confirmed password
    //show a message or navigate to the login page
    //catch error
  };
  return (
    <div>
      <button onClick={() => navigate("/")}>Back to Home</button>

      <div className="loginContainer">
        <div className="login">
          <h1>Register </h1>

          <input
            type="text"
            value={name}
            onChange={setName}
            placeholder="Enter your name"
          />

          <input
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={setPhone}
          />
          <input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm Password"
          />

          <button onClick={handleRegister}>Register</button>
          <Link to="/login">Already Registered? Go to Login</Link>
          <div>{error && <div error={error} isError={true}></div>}</div>
        </div>
      </div>
    </div>
  );
};
export default RegisterComponent;
