import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./ResultsComponent.css";
import { userScoreContext } from "../../Context/UserScoreContext";

const ResultComponent = () => {
  const {
    numOfCorrectAnswers,
    numOfWrongAnswers,
    runningAverageScore,
    resetScore,
    userAnswers,
  } = useContext(userScoreContext);

  const highScoring = runningAverageScore > 70;
  const navigate = useNavigate();

  const handlePlayAgain = () => {
    resetScore();
    navigate("/quiz");
  };

  return (
    <div className="result-container">
      <main className="results-content">
        <h3 className="score-heading">{`Your Score: ${runningAverageScore.toFixed(
          1
        )}%`}</h3>
        <div className="score-details">
          <p>{`Correct Answers: ${numOfCorrectAnswers}`}</p>
          <p>{`Wrong Answers: ${numOfWrongAnswers}`}</p>
        </div>
        <p className={highScoring ? "feedback-positive" : "feedback-negative"}>
          {highScoring
            ? "Great work! You are well on your way to identifying conspiracy theories you encounter in everyday life."
            : "You need work! Get off TikTok! Read!"}
        </p>

        <h4 className="review-heading">Let's Review Your Answers</h4>
        <ul className="answers-review-list">
          {userAnswers.map((answer, index) => (
            <li key={index} className="answer-item">
              <strong>Question:</strong> {answer.question} <br />
              <strong>You answered:</strong>{" "}
              {answer.userAnswer === "fact" ? "Fact" : "Fiction"} <br />
              <span
                className={
                  answer.userAnswer === answer.correctAnswer
                    ? "correct"
                    : "wrong"
                }
              >
                {answer.userAnswer === answer.correctAnswer
                  ? "Correct!"
                  : `Incorrect! Correct answer was: ${
                      answer.correctAnswer === "fact" ? "Fact" : "Fiction"
                    }`}
              </span>
            </li>
          ))}
        </ul>

        <div className="button-group">
          <button onClick={handlePlayAgain} className="play-again-button">
            Play Again
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="leaderboard-button"
          >
            See the Leaderboard
          </button>
        </div>
        <a href="/submit-fact" className="submit-fact-link">
          Submit your own fact or fiction here!
        </a>
      </main>
    </div>
  );
};

export default ResultComponent;
