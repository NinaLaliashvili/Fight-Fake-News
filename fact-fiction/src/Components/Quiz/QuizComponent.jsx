import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./QuizComponent.css";
import { userScoreContext } from "../../Context/UserScoreContext";

const QuizComponent = () => {
  const navigate = useNavigate();
  const { userResults, setUserResults } = useContext(userScoreContext);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch approved facts
    axios
      .get("http://localhost:3082/approved-facts")
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching approved facts:", error);
      });
  }, []);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    // Logic to check answer and update score if needed
  };

  const handleNext = () => {
    const { type } = questions[currentIndex];
    if (type == selectedOption) {
      console.log(type, selectedOption);
      const newScore = score + 1;
      setScore(newScore);
    } else {
      const sameScore = score + 0;
      setScore(sameScore);
    }
    //this is clunky but EF worked thru adding score
    // Move to the next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate to results if there are no more questions
      handleSubmit();
      // navigate("/results");
      //perform the results work :)
      //send result and username to server from here?
    }
    setSelectedOption(null); //reset the selected option for the next question
  };

  const handleSubmit = () => {
    const totalQuestionsNum = questions.length;
    const percentageCorrect = (score * 100) / totalQuestionsNum;
    const rounded = percentageCorrect.toFixed(1);
    setUserResults(rounded);
    console.log(userResults);
    navigate("/results");
    //this sets the score in context; we will need to also mark correct vs incorrect in future versions for each index
  };
  const currentFact = questions[currentIndex];
  const currentQuestion = questions[currentIndex]?.title || "Loading..."; // Default to "Loading..." if questions aren't fetched yet
  const currentQuestionDescription =
    currentFact?.description || "Fetching description...";

  return (
    <div className="quiz-container">
      <main className="quiz-content">
        <span>Score: {score}</span>
        <p>{currentQuestion}</p>
        <p>{currentQuestionDescription}</p>
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
          <span>50/50</span>
          <span>Poll Audience</span>
        </div>
        <button onClick={handleSubmit}>End Game and See Results</button>
      </main>
    </div>
  );
};

export default QuizComponent;
