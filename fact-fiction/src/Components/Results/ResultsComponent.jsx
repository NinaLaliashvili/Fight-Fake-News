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
        <h3>{`Your Score: ${runningAverageScore.toFixed(1)}%`}</h3>
        <p>{`Correct Answers: ${numOfCorrectAnswers}`}</p>
        <p>{`Wrong Answers: ${numOfWrongAnswers}`}</p>
        {highScoring ? (
          <p>
            Great work! You are well on your way to identifying conspiracy
            theories you encounter in everyday life.
          </p>
        ) : (
          <p>You need work! Get off TikTok! Read!</p>
        )}

        <h4>Lets Review Your Answers</h4>
        <ul>
          {userAnswers.map((answer, index) => (
            <li key={index}>
            <strong>Question:</strong> {answer.question} <br />
            <strong>You answered:</strong> {answer.userAnswer === 'fact' ? 'Fact' : 'Fiction'} <br />
            {answer.userAnswer === answer.correctAnswer ? 
              <span className="correct" style={{color: 'green'}}>Correct!</span> :
              <span className="wrong" style={{color: 'red'}}>
                Incorrect! Correct answer was: {answer.correctAnswer === 'fact' ? 'Fact' : 'Fiction'}
              </span>}
          </li>
          ))}
        </ul>

        <button onClick={handlePlayAgain}>Play Again</button>
        <button onClick={() => navigate("/leaderboard")}>
          See the Leaderboard
        </button>
        <a href="/submit-fact" className="userFact">
          Submit your own fact or fiction here!
        </a>
      </main>
    </div>
  );
};

export default ResultComponent;
