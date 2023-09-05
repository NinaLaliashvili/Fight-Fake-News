import axios from "axios";
import { useEffect, useState } from "react";
import "./leaderboardadmin.css";

export const LeaderboardAdmin = () => {
  const [users, setUsers] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3082/top-scores").then((response) => {
      setUsers(response.data);
    });
  }, []);

  const removeUser = async (userId) => {
    await axios.delete(`http://localhost:3082/remove-user/${userId}`);
    setUsers(users.filter((user) => user._id !== userId));
  };

  const addUser = async (e) => {
    e.preventDefault();
    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const score = parseFloat(e.target.score.value);

    if (users.length >= 5) {
      setShowErrorModal(true);
      return;
    }

    const { data } = await axios.post("http://localhost:3082/add-user", {
      firstName,
      lastName,
      score,
    });

    setUsers([...users, { _id: data.id, firstName, lastName, score }]);
    e.target.reset();
  };

  return (
    <div>
      <h1>Admin View</h1>
      <h2>Users</h2>
      {users.map((user) => (
        <div className="userrs" key={user._id}>
          <h4>
            {user.firstName} {user.lastName} - {user.score.toFixed(1)}
          </h4>
          <button className="bttn" onClick={() => removeUser(user._id)}>
            Remove
          </button>
        </div>
      ))}

      <h2>Add User</h2>
      <form className="forrm" onSubmit={addUser}>
        <input name="firstName" placeholder="First Name" required />
        <input name="lastName" placeholder="Last Name" required />
        <input name="score" placeholder="Score" required />
        <button type="submit">Add User</button>
      </form>

      {showErrorModal && (
        <div className="error-modal">
          <p>Max number of users is 5.</p>
          <button onClick={() => setShowErrorModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
};
