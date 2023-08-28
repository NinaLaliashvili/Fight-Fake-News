import React from "react";
import "./LeaderboardComponent.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "../../Context/AuthContext";
import { useSpring, animated, easings } from "@react-spring/web";

import axios from "axios";
const cuteCow = require("../Home/cow.png");
const bat = require("../Home/bat.png");

const LeaderboardComponent = () => {
  const { username } = useContext(LoginContext);
  console.log(username);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showCow, setShowCow] = useState(false);
  const navigate = useNavigate();

  const springsFly = useSpring({
    from: { y: 4, x: 0 },
    to: async (next, cancel) => {
      await next({ y: 2 });
      await next({ y: -2, x: 2 });
      await next({ y: 0 });
    },
    loop: true,
    config: {
      tension: 80,
      mass: 1,
      friction: 25,
      velocity: 0.1,
      precision: 0.01,
    },
  });

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
        <h2>
          Leaderboard{" "}
          <span>
            {" "}
            <animated.img
              src={bat}
              alt="bat"
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                ...springsFly,
              }}
              onClick={() => setShowCow(!showCow)}
            />
          </span>
          <span>
            {showCow && (
              <animated.img
                src={cuteCow}
                alt="cow"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 100,
                  ...springsFly,
                }}
              />
            )}
          </span>
        </h2>
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
                <td>{entry.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default LeaderboardComponent;
