import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./QuizComponent.css";
import socketIOClient from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import { LoginContext } from "../../Context/AuthContext";

const ENDPOINT = "http://localhost:3082"; // Socket.io server endpoint

const CompetitionComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [opponentName, setOpponentName] = useState("");
  const [yourScore, setYourScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState("");
  const { userId, token } = useContext(LoginContext);
  let socket;

  useEffect(() => {
    console.log("Client side userId:", userId);
    console.log("Client side token:", token);
    // Initialize Socket.IO Connection
    socket = socketIOClient(ENDPOINT, {
      query: { userId, token },
    });

    socket.on("connect", () => {
      socket.emit("enterMatch", userId);
    });

    socket.on("waiting", () => {
      setIsLoading(true);
    });

    socket.on("matched", (data) => {
      console.log("Matched event data: ", data);
      setIsLoading(false);
      setOpponentName(data.opponentName);
      toast.success(`You are matched with ${data.opponentName}`);
    });

    socket.on("scoreUpdate", (data) => {
      setYourScore(data.yourScore);
      setOpponentScore(data.opponentScore);
    });

    socket.on("endGame", (data) => {
      setWinner(data.winner);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleAnswer = (isCorrect) => {
    // Update score based on the answer and notify the backend
    if (isCorrect) {
      setYourScore((prevScore) => prevScore + 1);
    }
    socket.emit("answer", { isCorrect /* Your User ID */ });
  };

  const handleEndGame = () => {
    socket.emit("endGame" /* Your User ID */);
  };

  return (
    <div className="quiz-container">
      <ToastContainer />
      <h1>Quiz Game</h1>
      {isLoading ? (
        <p>Waiting for other user to join...</p>
      ) : (
        <>
          {opponentName && <p>You are playing with {opponentName}</p>}
          <p>Your score: {yourScore}</p>
          <p>Opponent's score: {opponentScore}</p>
          <button onClick={() => handleAnswer(true)}>Correct</button>
          <button onClick={() => handleAnswer(false)}>Wrong</button>
          <button onClick={handleEndGame}>End Game</button>
          {winner && <p>Winner is {winner}</p>}
        </>
      )}
    </div>
  );
};

export default CompetitionComponent;
