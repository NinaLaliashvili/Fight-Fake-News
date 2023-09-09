import React, { useState, useEffect, useContext } from "react";
import "./LeaderboardComponent.css";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";
import { useSpring, animated } from "@react-spring/web";
import { ToastContainer, toast } from "react-toastify";
import Confetti from "react-confetti";
import axios from "axios";
import {
  configFlyAnimation,
  configBasicAnimation,
} from "../../helpers/animations";
import { userScoreContext } from "../../Context/UserScoreContext";
const cuteCow = require("../Home/cow.png");
const bat = require("../Home/bat.png");
const lizard = require("../Home/lizard.png");

const LeaderboardComponent = () => {
  const { username, token } = useContext(LoginContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showCow, setShowCow] = useState(false);
  const [showLizard, setShowLizard] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [rotation, setRotation] = useSpring(() => ({
    transform: "rotate(0deg)",
  }));
  const [runConfetti, setRunConfetti] = useState(false);
  const { fetchTopScores } = useContext(userScoreContext);
  const [userResults, setUserResults] = useState([]);

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
    from: { y: 2, x: 0 },
    to: async (next, cancel) => {
      await next({ y: -2, x: 2 });
    },
    loop: true,
    config: configFlyAnimation,
  });

  const springsCelebrate = useSpring({
    from: { x: 0, y: 0 },
    to: async (next, cancel) => {
      await next({ x: 50, y: 30 });
      await next({ x: 100, y: -30 });
      await next({ x: 150, y: 0 });
      await next({ x: 200, y: -30 });
      await next({ x: 250, y: -10 });
      await next({ x: 300, y: -40 });
      await next({ x: 150, y: 0 });
      await next({ x: 0, y: -10 });
    },
    loop: true,
    config: configBasicAnimation,
  });

  const revealLizard = () => {
    setShowLizard(true);
    showUserFinalClue(
      "the seas are rising globally along with global sea temperature. It's a hot mess. But for your final clue let the truth reveal from la sea in french"
    );
  };

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3082/top-scores", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setLeaderboardData(response.data); // assuming response.data contains your leaderboard data
        })
        .catch((error) => {
          console.error("Error fetching top scores:", error);
        });
    } else {
      // Handle the case where token is null or undefined
    }
  }, [token]);

  const showUserFinalClue = (message) => {
    toast.success(`${message}`, {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  const guideUserToSecret = () => {
    setShowLizard(false);
    showUserFinalClue("hold onto your butts");
    setTimeout(() => {
      navigate("/knowledge");
    }, 2000);
  };

  useEffect(() => {
    fetchTopScores();
  }, []);

  useEffect(() => {
    const isUserOnLeaderboard = userResults.some(
      (entry) =>
        `${entry.firstName} ${entry.lastName}`.trim() ===
        (username ? username.trim() : "")
    );

    setRunConfetti(isUserOnLeaderboard);
  }, [userResults, username]);

  return (
    <div className="leaderboard-container">
      {runConfetti && <Confetti />}
      <ToastContainer theme="dark" />
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
          <span>
            {showLizard && (
              <animated.img
                src={lizard}
                alt="lizard"
                style={{
                  width: 200,
                  height: 180,
                  borderRadius: 100,
                  ...springsCelebrate,
                }}
                onClick={guideUserToSecret}
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
                onClick={revealLizard}
              >
                <td>
                  {entry.avatar && (
                    <img
                      src={entry.avatar}
                      alt="User Avatar"
                      className="avatar"
                    />
                  )}
                  {`${entry.firstName} ${entry.lastName}`}
                </td>
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
      <div className="motivational-section">
        <h3 className="blal">Thoughts that Propel: Your Daily Lift-off!</h3>
        <div className="motivational-item">
          <blockquote>
            "Success is not final, failure is not fatal: It is the courage to
            continue that counts." - Winston S. Churchill
          </blockquote>
          <img
            src="https://cdn.dribbble.com/users/129972/screenshots/3964116/75_smile.gif"
            alt="Motivational Pic 1"
            className="motivational-image"
          />
        </div>
        <div className="motivational-item">
          <img
            src="https://media.tenor.com/71T1E-HH6AsAAAAj/ton-ton-friends-lets-celebrate.gif"
            alt="Motivational Pic 2"
            className="motivational-image0"
          />
          <blockquote>
            "Success is not the key to happiness. Happiness is the key to
            success. If you love what you are doing, you will be successful."
          </blockquote>
        </div>
        <div className="motivational-item">
          <blockquote>
            "Hardships often prepare ordinary people for an extraordinary
            destiny." - C.S. Lewis
          </blockquote>

          <img
            src="https://media.tenor.com/JMExTCl4NYIAAAAC/positive-positivity.gif"
            alt="Motivational Pic 3"
            className="motivational-image"
          />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardComponent;
