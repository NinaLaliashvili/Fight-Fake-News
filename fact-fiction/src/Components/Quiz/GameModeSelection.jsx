import React from "react";
import { useNavigate } from "react-router-dom";

const GameModeSelection = () => {
  const navigate = useNavigate();

  const goToSinglePlayer = () => {
    navigate("/quiz");
  };

  const goToCompetition = () => {
    navigate("/competition");
  };

  return (
    <div>
      <h1>Choose Game Mode</h1>
      <button onClick={goToSinglePlayer}>Single Player</button>
      <button onClick={goToCompetition}>Competition</button>
    </div>
  );
};

export default GameModeSelection;
