import React, { useState, useEffect, useContext } from "react";
import "./LeaderboardComponent.css";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";
import { useSpring, animated } from "@react-spring/web";
import Confetti from "react-confetti";

import axios from "axios";
const cuteCow = require("../Home/cow.png");
const bat = require("../Home/bat.png");

const LeaderboardComponent = () => {
  const { username } = useContext(LoginContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showCow, setShowCow] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [rotation, setRotation] = useSpring(() => ({
    transform: "rotate(0deg)",
  }));
  const [runConfetti, setRunConfetti] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const rotateBoard = () => {
      setRotation({
        transform: `rotate(${Math.random() * 6 - 3}deg)`, // Random rotation between -3 and 3 degrees
        config: {
          tension: 150,
          friction: 12,
        },
      });

      // Reset the rotation after 3 seconds
      setTimeout(() => {
        setRotation({
          transform: "rotate(0deg)",
          immediate: true,
        });
      }, 3000);
    };

    // Set an interval to rotate the board occasionally (e.g., every 10 seconds)
    const rotationInterval = setInterval(rotateBoard, 1000);

    return () => {
      clearInterval(rotationInterval);
    };
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if username is in leaderboard data
    const isUserOnLeaderboard = leaderboardData.some(
      (entry) =>
        `${entry.firstName} ${entry.lastName}`.trim() ===
        (username ? username.trim() : "")
    );

    setRunConfetti(isUserOnLeaderboard);
  }, [leaderboardData, username]);

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
        setLeaderboardData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching top scores:", error);
      });
  }, []);

  return (
    <div className="leaderboard-container">
      {runConfetti && <Confetti />}
      <animated.main style={rotation}>
        <h2>
          Leaderboard
          <span>
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
      </animated.main>

      <img
        src={cuteCow}
        alt="Hidden Cow"
        style={{
          width: "30px",
          height: "30px",
          opacity: 0.5,
          position: "absolute",
          top: "5%",
          left: "30%",
        }}
        onClick={() => setShowEasterEgg(true)}
      />

      {showEasterEgg && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <p>Why did the cow go to space? To see the moooon!</p>
          <button onClick={() => setShowEasterEgg(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default LeaderboardComponent;
