import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "./UserSetting.css";

const UserSetting = () => {
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [originalUserData, setOriginalUserData] = useState({});
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  const loadFacts = () => {
    axios
      .get(`http://localhost:3082/user/${userId}`)
      .then((resp) => {
        setOriginalUserData(resp.data);
        setLoggedInUser(resp.data);
        console.log(resp.data);
      })
      .catch((err) => {
        notifyUserError("Error user update.");
      });
  };

  useEffect(() => {
    loadFacts();
  }, []);

  const notifyUserError = (message) => {
    toast.error(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const notifyUserSuccess = (message) => {
    toast.success(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleSave = () => {
    axios
      .put(`http://localhost:3082/user/${userId}`, {
        email: loggedInUser.email,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        phone: loggedInUser.phone,
      })
      .then((resp) => {
        loadFacts();
        localStorage.setItem("firstName", loggedInUser.firstName);
        localStorage.setItem("lastName", loggedInUser.lastName);
        notifyUserSuccess("User updated successfully!");
      })
      .catch((err) => {
        notifyUserError("Error user update.");
      });
  };

  const handleCancle = () => {
    setLoggedInUser(originalUserData);
  };
  return (
    <div>
      <ToastContainer theme="light" />

      <h1>User Setting</h1>
      <div className="userInfo">
        <input
          type="email"
          value={loggedInUser.email || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, email: e.target.value })
          }
          placeholder="email..."
        />
        <input
          type="text"
          value={loggedInUser.firstName || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, firstName: e.target.value })
          }
          placeholder="first name..."
        />
        <input
          type="text"
          value={loggedInUser.lastName || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, lastName: e.target.value })
          }
          placeholder="last name..."
        />
        <input
          type="tel"
          value={loggedInUser.phone || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, phone: e.target.value })
          }
          placeholder="phone..."
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancle}>Cancel</button>
      </div>
    </div>
  );
};
export default UserSetting;
