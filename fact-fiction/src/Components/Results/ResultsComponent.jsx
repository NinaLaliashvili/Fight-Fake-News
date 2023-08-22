import React from "react";
import { useNavigate } from "react-router-dom";
import "./ResultsComponent.css";

const ResultComponent = () => {
  const navigate = useNavigate();

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
      <header>
        <h1>Results (or some header here )</h1>
        <nav>{/* Other navigation links if you want*/}</nav>
      </header>
      <main>
        <h2>
          Your Score: 1/2 - just forthe example, after mongo and server it will
          be done, now it is hardcoded , take a look into{" "}
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
        <a href="/submit-fact">Submit your own fact or fiction</a>
      </main>
    </div>
  );
};

export default ResultComponent;
