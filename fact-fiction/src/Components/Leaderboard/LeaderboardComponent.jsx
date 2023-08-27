import React from "react";
import "./LeaderboardComponent.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "../../Context/AuthContext";
import axios from "axios";

const LeaderboardComponent = () => {
  const { username } = useContext(LoginContext);
  console.log(username);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3082/top-scores")
      .then((response) => {
        console.log(response.data);
        setLeaderboardData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching top scores:", error);
      });
  }, []);

  return (
    <div className="leaderboard-container">
      <main>
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <tr
                key={index}
                className={
                  `${entry.firstName} ${entry.lastName}`.trim() ===
                  (username ? username.trim() : "")
                    ? "current-user"
                    : ""
                }
              >
                <td>{`${entry.firstName} ${entry.lastName}`}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default LeaderboardComponent;
