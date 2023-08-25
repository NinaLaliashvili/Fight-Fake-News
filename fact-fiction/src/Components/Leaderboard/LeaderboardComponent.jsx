import React from "react";
import "./LeaderboardComponent.css";
import { useNavigate } from "react-router-dom";

const LeaderboardComponent = () => {
  const navigate = useNavigate();
  // Sample data
  const sampleLeaderboard = [
    { name: "John Doe", score: 10 },
    { name: "Jane Smith", score: 9 },
    { name: "Alice", score: 8 },
  ];

  return (
    <div className="leaderboard-container">
      <header>
        <h1>Leaderboard</h1>
        <nav>
          <button onClick={() => navigate("/")}>Home</button>
        </nav>
      </header>
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
            {sampleLeaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{entry.name}</td>
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
