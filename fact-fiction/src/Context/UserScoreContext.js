import { createContext, useState, useContext } from "react";
import axios from "axios";

export const userScoreContext = createContext({});

const Provider = userScoreContext.Provider;

export const UserScoreProvider = ({ children }) => {
  const [numOfCorrectAnswers, setNumOfCorrectAnswers] = useState(0);
  const [numOfWrongAnswers, setNumOfWrongAnswers] = useState(0);
  const [runningAverageScore, setRunningAverageScore] = useState(0);
  /*runningAverageScore will equal numOfCorrect / numOfTotal as a percentage (yay math!) whenever we call it
   */
  const [userAnswers, setUserAnswers] = useState([]);

  const recordAnswer = (question, userAnswer, correctAnswer) => {
    setUserAnswers((prev) => [
      ...prev,
      { question, userAnswer, correctAnswer },
    ]);
  };

  const saveScoreToBackend = async (userId, token) => {
    try {
      await axios.post(
        "http://localhost:3082/save-score",
        {
          userId: userId,
          score: runningAverageScore,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Score saved successfully");
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  const fetchTopScores = async () => {
    try {
      const response = await axios.get("http://localhost:3082/top-scores");
      console.log("Top scores fetched successfully", response.data);
      setUserResults(response.data);
    } catch (error) {
      console.error("Error fetching top scores:", error);
    }
  };

  const resetScore = () => {
    setNumOfCorrectAnswers(0);
    setNumOfWrongAnswers(0);
    setRunningAverageScore(0);
    setUserAnswers([]);
  };
  const [userResults, setUserResults] = useState(0);

  const value = {
    numOfCorrectAnswers,
    setNumOfCorrectAnswers,
    numOfWrongAnswers,
    setNumOfWrongAnswers,
    runningAverageScore,
    setRunningAverageScore,
    userResults,
    setUserResults,
    resetScore,
    userAnswers,
    setUserAnswers,
    recordAnswer,
    saveScoreToBackend,
    fetchTopScores,
  };
  return <Provider value={value}>{children}</Provider>;
};
