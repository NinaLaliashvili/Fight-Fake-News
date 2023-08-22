import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizComponent.css";

const QuizComponent = () => {
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [question, setQuestion] = useState("Bananas are berries."); // Sample hardcoded statement

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    //here, you can also add logic to check the answer and update the score
  };

  const handleNext = () => {
    //here, you can update to the next question from the database (or the next hardcoded question for now)
    setSelectedOption(null); //reset the selected option for the next question
  };

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <button onClick={() => navigate("/")}>Home</button>
        <h1>Fact or Fiction Quiz</h1>
        <span>Score: {score}</span>
      </header>
      <main className="quiz-content">
        <p>{question}</p>
        <div className="options">
          <label>
            <input
              type="radio"
              value="fact"
              checked={selectedOption === "fact"}
              onChange={() => handleOptionChange("fact")}
            />
            Fact
          </label>
          <label>
            <input
              type="radio"
              value="fiction"
              checked={selectedOption === "fiction"}
              onChange={() => handleOptionChange("fiction")}
            />
            Fiction
          </label>
        </div>
        <button onClick={handleNext}>Next</button>
        <div className="lifelines">
          {/* possible clickable icons or buttons */}
          <span>50/50</span>
          <span>Poll Audience</span>
        </div>
        <button onClick={() => navigate("/results")}>
          End Game and See Results
        </button>
      </main>
    </div>
  );
};

export default QuizComponent;
