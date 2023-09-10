import axios from "axios";
import { useEffect, useState, useContext } from "react";
import "./UsersView.css";
import { LoginContext } from "../../../Context/AuthContext";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export const UsersView = () => {
  const [listUsers, setListUsers] = useState([]);
  const [listOrigin, setListOrigin] = useState([]);
  const [searchByFirstName, setSearchByFirstName] = useState("");
  const [searchByLastName, setSearchByLastName] = useState("");
  const [searchByEmail, setSearchByEmail] = useState("");
  const { isUserAdmin } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserAdmin) {
      navigate("/");
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userResponse = await axios.get(`http://localhost:3082/users`);
      setListUsers(userResponse.data);
      setListOrigin(userResponse.data);
    } catch (error) {
      console.error("Error details:", error.response);
    }
  };

  const handleSearch = () => {
    const filteredUsers = listOrigin.filter((user) => {
      const firstNameMatch =
        searchByFirstName === "" ||
        user.firstName.toLowerCase().includes(searchByFirstName.toLowerCase());
      const lastNameMatch =
        searchByLastName === "" ||
        user.lastName.toLowerCase().includes(searchByLastName.toLowerCase());
      const emailMatch =
        searchByEmail === "" ||
        user.email.toLowerCase().includes(searchByEmail.toLowerCase());

      return firstNameMatch && lastNameMatch && emailMatch;
    });

    setListUsers(filteredUsers);
  };

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

  const makeUserAdmin = async (userId, currentIsAdmin) => {
    try {
      const userToUpdate = listUsers.find((user) => user._id === userId);

      if (!userToUpdate) {
        console.error("User not found");
        return;
      }

      const userDataToUpdate = {
        email: userToUpdate.email,
        firstName: userToUpdate.firstName,
        lastName: userToUpdate.lastName,
        phone: userToUpdate.phone,
        isAdmin: !currentIsAdmin,
      };

      await axios
        .put(`http://localhost:3082/user/${userId}`, userDataToUpdate)
        .then((resp) => {
          if (userDataToUpdate.isAdmin) {
            notifyUserSuccess("Yay! This user is an admin now!");
          } else {
            notifyUserSuccess("You removed this user from admin.");
          }
        })
        .catch((err) => {
          notifyUserError(err);
        });

      setListUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isAdmin: !currentIsAdmin } : user
        )
      );
    } catch (error) {
      console.error("Error details:", error.response);
    }
  };

  return (
    <div>
      <ToastContainer theme="light" />
      <h1 className="column center columnn">Search User</h1>
      <div className="column">
        <input
          placeholder="search by first name"
          value={searchByFirstName}
          onChange={(e) => setSearchByFirstName(e.target.value)}
          className="item"
        />
        <input
          placeholder="search by last name"
          value={searchByLastName}
          onChange={(e) => setSearchByLastName(e.target.value)}
          className="item"
        />
        <input
          placeholder="search by email"
          value={searchByEmail}
          onChange={(e) => setSearchByEmail(e.target.value)}
          className="item"
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="users-list-container ">
        {listUsers.map((user) =>
          user._id && user.firstName && user.lastName && user.email ? (
            <div className="box" key={user._id}>
              <h3>{user.firstName}</h3>
              <h3>{user.lastName}</h3>
              <h4>{user.email}</h4>
              <button
                className="adminno"
                onClick={() => makeUserAdmin(user._id, user.isAdmin)}
              >
                {user.isAdmin ? "Remove from admin" : "Make admin"}
              </button>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};
