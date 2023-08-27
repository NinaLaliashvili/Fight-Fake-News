import { createContext, useState } from "react";

export const userScoreContext = createContext({});

const Provider = userScoreContext.Provider;

export const UserScoreProvider = ({ children }) => {
  const [numOfCorrectAnswers, setNumOfCorrectAnswers] = useState(0);
  const [numOfWrongAnswers, setNumOfWrongAnswers] = useState(0);
  const [runningAverageScore, setRunningAverageScore] = useState(0);
  /*runningAverageScore will equal numOfCorrect / numOfTotal as a percentage (yay math!) whenever we call it
   */
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
  };

  return <Provider value={value}>{children}</Provider>;
};
