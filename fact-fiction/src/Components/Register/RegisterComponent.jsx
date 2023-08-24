import { useState } from "react";
import "./RegisterComponent.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const RegisterComponent = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const notifyError = (message) => {
    toast.error(`${message}, sorry!`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const notifySuccess = (message) => {
    toast.success(`${message}, sorry!`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleRegister = () => {
    if (password === confirmPassword) {
      axios
        .post(process.env.REACT_APP_API_PORT + "signup", {
          email: email,
          name: name,
          phone: phone,
          password: password,
        })
        .then((resp) => {
          console.log(resp);
          notifySuccess("account created! You can now login");
        })
        .catch((err) => {
          console.log(err);
          setError(true);
          notifyError(err);
        });
    } else {
      setError(true);
      notifyError("passwords must match!");
    }
    //post name, email, phone, password and confirmed password
    //show a message or navigate to the login page
    //catch error
  };
  return (
    <div>
      <ToastContainer theme="light" />
      <button onClick={() => navigate("/")}>Back to Home</button>

      <div className="registerContainer">
        <div className="register">
          <h1>Register </h1>

          <input
            type="text"
            value={name}
            onChange={setName}
            placeholder="Enter your name"
            className="input"
          />

          <input
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email"
            className="input"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={setPhone}
            className="input"
          />
          <input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            className="input"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm Password"
            className="input"
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
