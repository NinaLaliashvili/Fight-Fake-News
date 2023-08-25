import axios from "axios";
import { useEffect, useState } from "react";
import "./UsersView.css";

export const UsersView = () => {
  const [listUsers, setListUsers] = useState([]);
  const [listOrigin, setListOrigin] = useState([]);
  const [searchByFirstName, setSearchByFirstName] = useState("");
  const [searchByLastName, setSearchByLastName] = useState("");
  const [searchByEmail, setSearchByEmail] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userResponse = await axios.get(`http://localhost:3071/users`);
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

  return (
    <div>
      <h1>Search User</h1>
      <div>
        <input
          placeholder="search by first name"
          value={searchByFirstName}
          onChange={(e) => setSearchByFirstName(e.target.value)}
        />
        <input
          placeholder="search by last name"
          value={searchByLastName}
          onChange={(e) => setSearchByLastName(e.target.value)}
        />
        <input
          placeholder="search by email"
          value={searchByEmail}
          onChange={(e) => setSearchByEmail(e.target.value)}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      <div>
        {listUsers.map((user) => (
          <div className="box" key={user._id}>
            <h3>{user.firstName}</h3>
            <h3>{user.lastName}</h3>
            <h4>{user.email}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};
