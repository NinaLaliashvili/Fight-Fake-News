import React from "react";
import { useNavigate } from "react-router-dom";
import "./QuizComponent.css";

const GameModeSelection = () => {
  const navigate = useNavigate();

  const goToSinglePlayer = () => {
    navigate("/quiz");
  };

  const goToCompetition = () => {
    navigate("/competition");
  };

  return (
    <div className="game-mode-selection-container">
      <h1 className="game-mode-selection-title">Choose Game Mode</h1>
      <button className="game-mode-selection-button" onClick={goToSinglePlayer}>
        Single Player
      </button>
      <button className="game-mode-selection-button" onClick={goToCompetition}>
        Competition
      </button>
    </div>
  );
};

export default GameModeSelection;
