import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useSpring, animated } from "@react-spring/web";

import "./SecretComponent.css";
const cuteCow = require("../Home/cow.png");
const fox = require("../Home/fox.png");

export const SecretComponent = () => {
  const [answers, setAnswers] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showTreat, setShowTreat] = useState(false);
  const [userSolvedQuiz, setUserSolvedQuiz] = useState(false);
  const questPassword = `hahatomer`;
  const [userInput, setUserInput] = useState("");

  const loadFacts = () => {
    axios
      .get(`http://localhost:3082/approved-facts`)
      .then((resp) => {
        setAnswers(resp.data);
      })
      .catch((err) => {
        notifyUserError("Error fetching approved facts.");
      });
  };

  const showHideTreat = () => {
    notifyUserSuccess("finding BS is your jam!");
    setShowTreat(!showTreat);
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

  const springsRun = useSpring({
    from: { y: 0, x: 0 },
    to: async (next, cancel) => {
      await next({ x: 5 });
      await next({ x: 7 });
      await next({ x: -5 });
      await next({ y: 0, x: 5 });
      await next({ y: 5 });
      await next({ y: 7 });
      await next({ y: -5 });
      await next({ y: 5 });
    },
    loop: true,
    config: {
      tension: 170,
      mass: 1,
      friction: 25,
      velocity: 0.3,
      precision: 0.01,
    },
  });
  const springsWalk = useSpring({
    from: { y: 0, x: 0 },
    to: async (next, cancel) => {
      await next({ x: 5 });
      await next({ x: 7 });
      await next({ x: 10 });
      await next({ x: 8 });
      await next({ y: 5 });
      await next({ y: 0 });
    },
    loop: false,
    config: {
      tension: 170,
      mass: 1,
      friction: 25,
      velocity: 0.3,
      precision: 0.01,
    },
  });

  const handleShowAnswers = () => {
    if (showAnswers) {
      notifyUserError(
        "If you leave the cave of secrets... remember the password lol- or quest again!"
      );
    }
    setShowAnswers(!showAnswers);
    setUserSolvedQuiz(false);
  };

  const checkUserInput = () => {
    if (userInput === questPassword) {
      setUserInput("");
      setUserSolvedQuiz(true);
      notifyUserSuccess(
        "CONGRATULATIONS! You've solved our quest! Now let the knowledge be yours..."
      );
    } else {
      notifyUserError(
        "incorrect password... look closely and don't forget to find the clues! Hint... things that move and look cute!"
      );
      setUserSolvedQuiz(false);
    }
  };
  return (
    <div>
      <ToastContainer theme="colored" />

      {!userSolvedQuiz ? (
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Enter Secret Code Below... your quest is almost at a close!</p>
          <input
            type="text"
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
            placeholder="go ahead... guess..."
          />
          <button onClick={checkUserInput}>Enter</button>
        </div>
      ) : (
        <div>
          <div className="flex">
            <h2>Here be knowledge...</h2>
            <button onClick={handleShowAnswers}>
              {!showAnswers ? `Ready...?` : `Hide From the Truth`}
            </button>
            {showAnswers && (
              <animated.img
                src={fox}
                alt="fox"
                style={{
                  width: 120,
                  height: 100,
                  borderRadius: 100,

                  ...springsRun,
                }}
                onClick={() =>
                  notifyUserSuccess(
                    "you caught up to the truth at last! Detective Fox is proud"
                  )
                }
              />
            )}
          </div>
          <div className="grid">
            {showAnswers &&
              answers.map((fact) => (
                <div key={fact._id} className="fact-item">
                  <div className="line">
                    <h4
                      style={{ color: fact.type == "fact" ? "green" : "red" }}
                      onClick={() => setShowTreat(!showTreat)}
                    >
                      {fact.type}
                    </h4>
                    {showTreat && (
                      <animated.img
                        src={cuteCow}
                        alt="fox"
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 100,

                          ...springsWalk,
                        }}
                        onClick={showHideTreat}
                      />
                    )}
                  </div>
                  <h2>{fact.title}</h2>
                  <p>{fact.description}</p>
                  <a
                    href={fact.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source
                  </a>{" "}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
