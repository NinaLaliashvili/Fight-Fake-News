import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { LoginContext } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./leaderboardadmin.css";

export const LeaderboardAdmin = () => {
  const [users, setUsers] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { isUserAdmin } = useContext(LoginContext);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newScore, setNewScore] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserAdmin) {
      navigate("/");
    }
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
    const score = parseInt(e.target.score.value, 10); // Parse score as integer

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

  const updateScore = async () => {
    try {
      await axios.put(`http://localhost:3082/update-score/${editingUserId}`, {
        score: parseInt(newScore, 10),
      });
      setUsers(
        users.map((user) =>
          user._id === editingUserId
            ? { ...user, score: parseInt(newScore, 10) }
            : user
        )
      );
      setEditingUserId(null);
      setNewScore("");
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };
  return (
    <div>
      <h2>Users</h2>
      {users.map((user) => (
        <div className="userrs" key={user._id}>
          <h4>
            {user.firstName} {user.lastName} - {user.score}
          </h4>
          {editingUserId === user._id ? (
            <div>
              <input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="New score"
              />
              <button className="bttn" onClick={updateScore}>
                Update Score
              </button>
            </div>
          ) : (
            <button className="bttn" onClick={() => setEditingUserId(user._id)}>
              Edit Score
            </button>
          )}
        </div>
      ))}
      {/* 
      <h2>Add User</h2>
      <form className="forrm" onSubmit={addUser}>
        <input name="firstName" placeholder="First Name" required />
        <input name="lastName" placeholder="Last Name" required />
        <input name="score" placeholder="Score" required />
        <button type="submit">Add User</button>
      </form>
{/*  */}
      {/* {showErrorModal && (
        <div className="error-modal">
          <p>Max number of users is 5.</p>
          <button onClick={() => setShowErrorModal(false)}>Close</button>
        </div>
      )} */}
    </div>
  );
};
