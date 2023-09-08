import { useState } from "react";
import "./RegisterComponent.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import UserAvatar from "../UserAvatar/UserAvatar";
import Pig from "../UserAvatar/avatars/pig.png";
import Rhino from "../UserAvatar/avatars/rhino.png";
import Bat from "../UserAvatar/avatars/bat.png";
import Elephant from "../UserAvatar/avatars/elephant.png";
import Elephant2 from "../UserAvatar/avatars/elephant2.png";
import Fox from "../UserAvatar/avatars/fox.png";
import Monkey from "../UserAvatar/avatars/monkey.png";
import Sun from "../UserAvatar/avatars/sun.png";
import Thumper from "../UserAvatar/avatars/thumper.png";
import Zebra from "../UserAvatar/avatars/zebra.png";
import { UserOutlined } from "@ant-design/icons";

const profileImages = [
  { src: Pig },
  { src: Rhino },
  { src: Bat },
  { src: Elephant },
  { src: Elephant2 },
  { src: Fox },
  { src: Monkey },
  { src: Sun },
  { src: Thumper },
  { src: Zebra },
];

const RegisterComponent = () => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorField, setErrorField] = useState("");
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
  });
  const defaultUserIcon = <UserOutlined />;

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

  const { email, password, confirmPassword, firstName, lastName, phone } =
    formState;

  const handleInputChange = (event) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const handleAvatarSelected = (avatarUrl) => {
    setFormState({
      ...formState,
      avatar: avatarUrl,
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    for (let key in formState) {
      if (key === "avatar") {
        continue; // Skip the "avatar" field
      }

      if (formState[key] === "") {
        notifyError(
          `Please fill in the ${key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field.`
        );
        setErrorField(key);
        return;
      }
    }

    // Check if password is between 6 and 30 characters, and includes at least one digit and one uppercase letter.
    if (!/^(?=.*\d)(?=.*[A-Z]).{6,30}$/.test(password)) {
      notifyError(
        "Password must be between 6-30 characters, include at least one digit and one uppercase letter!"
      );
      setErrorField("password");
      return;
    }

    if (password !== confirmPassword) {
      notifyError("Passwords do not match!");
      setErrorField("confirmPassword");
      return;
    }

    // Check if phone number contains only digits.
    if (!/^\d+$/.test(phone)) {
      notifyError("Phone number should only contain digits!");
      setErrorField("phone");
      return;
    }

    try {
      const users = await axios.get("http://localhost:3082/users");

      const isEmailExists = users.data.some((user) => user.email === email);
      const isPhoneExists = users.data.some((user) => user.phone === phone);

      if (isEmailExists) {
        notifyError("This email is already in use!");
        setErrorField("email");
        return;
      }

      if (isPhoneExists) {
        notifyError("This phone number is already in use!");
        setErrorField("phone");
        return;
      }

      if (!formState.avatar) {
        const randomAvatarIndex = Math.floor(Math.random() * profileImages.length);
        const randomAvatar = profileImages[randomAvatarIndex];
        formState.avatar = randomAvatar.src; 
    }

      const response = await axios.post(
        "http://localhost:3082/signup",
        formState
      );

      localStorage.setItem("userId", response.data.id);
      notifySuccess("Successfully registered!");
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign up", error);
      setErrorMessage("Failed to sign up");
    }
  };

  return (
    <div>
      <ToastContainer theme="light" />
      <button onClick={() => navigate("/")}>Back to Home</button>

      <div className="registerContainer">
        <div className="register">
          <h1>Register </h1>
          <UserAvatar
            avatarSelected={handleAvatarSelected}
            profileImages={profileImages}
            defaultAvatar={defaultUserIcon}
          />
          <form onSubmit={handleRegister}>
            <input
              className="input"
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              placeholder="Email"
            />
            <input
              className="input"
              type="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Password"
            />
            <input
              className="input"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
            />
            <input
              className="input"
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleInputChange}
              placeholder="First Name"
            />
            <input
              className="input"
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
            />
            <input
              className="input"
              type="tel"
              name="phone"
              value={phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />
            <button type="submit">Register</button>
            <Link to="/login">Already Registered? Go to Login</Link>
          </form>
          {/* <div>{error && <div error={error} isError={true}></div>}</div> */}
        </div>
      </div>
    </div>
  );
};
export default RegisterComponent;
