import React from "react";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResultsComponent.css";
import { userScoreContext } from "../../Context/UserScoreContext";
const ResultComponent = () => {
  const { userResults } = useContext(userScoreContext);
  const [highScoring, setHighScoring] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userResults > 70) {
      setHighScoring(true);
    }
  }, []);
  //soeme data
  const sampleResults = [
    {
      statement: "Bananas are berries.",
      correct: true,
      userAnswer: true,
      infoLink: "https://example.com",
    },
    {
      statement: "Strawberries are berries.",
      correct: false,
      userAnswer: true,
      infoLink: "https://example2.com",
    },
    // ... here you can add more samples
  ];

  return (
    <div className="result-container">
      {/* <header>
        <h1>Results</h1>
      </header> */}
      <main className="results-content">
        <h3>{`Your Score: ${userResults}%`}</h3>
        {highScoring ? (
          <p>
            Great work! You are well on your way to identifying conspiracy
            theories you encounter in everyday life.
          </p>
        ) : (
          <p>You need work! Get off TikTok! Read!</p>
        )}
        <h2>
          instructions for admins smileyy
          <a
            href="https://docs.google.com/document/d/1AFEvLqQ2tzKPoL60fnX5GIA75TtSsylmayK4SD6XWSI/edit"
            target="blank"
          >
            google docs
          </a>
        </h2>{" "}
        <ul>
          {sampleResults.map((result, index) => (
            <li key={index}>
              <span
                className={
                  result.correct === result.userAnswer ? "correct" : "wrong"
                }
              >
                {result.statement}
              </span>
              <a
                href={result.infoLink}
                target="_blank"
                rel="noreferrer"
                className="info-icon"
              >
                [info]
              </a>
            </li>
          ))}
        </ul>
        <button onClick={() => navigate("/quiz")}>Play Again</button>
        <button onClick={() => navigate("/")}>Return Home</button>
        <a href="/submit-fact" className="userFact">
          Submit your own fact or fiction here!
        </a>
      </main>
    </div>
  );
};

export default ResultComponent;
