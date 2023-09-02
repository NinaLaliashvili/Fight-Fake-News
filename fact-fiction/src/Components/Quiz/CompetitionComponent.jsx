import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { userScoreContext } from "../../Context/UserScoreContext";
import { LoginContext } from "../../Context/AuthContext";
import socketIOClient from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import { useSpring, animated } from "@react-spring/web";
import { useNavigate } from "react-router-dom";

const ENDPOINT = "http://localhost:3082"; // Socket.io server endpoint
let socket;

const CompetitionComponent = () => {
  const navigate = useNavigate();
  const {
    numOfCorrectAnswers,
    setNumOfCorrectAnswers,
    numOfWrongAnswers,
    setNumOfWrongAnswers,
    runningAverageScore,
    setRunningAverageScore,
    setUserResults,
    recordAnswer,
  } = useContext(userScoreContext);

  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roomId, setRoomId] = useState("room1"); // hardcoded for simplicity
  const [opponentCurrentIndex, setOpponentCurrentIndex] = useState(0);
  const [opponentSelectedOption, setOpponentSelectedOption] = useState(null);
  const [matchFound, setMatchFound] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [quizEnded, setQuizEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const { userId, token } = useContext(LoginContext);

  useEffect(() => {
    // Fetch Questions
    axios
      .get("http://localhost:3082/approved-facts")
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching approved facts:", error);
      });

    // Start a new game session and get roomId
    // axios
    //   .post("http://localhost:3082/enterMatch", { userId })
    //   .then((response) => {
    //     console.log("Server Response:", response.data);
    //     const { message, roomId, opponentName, opponentId } = response.data;

    //     if (message === "Match found!" && opponentName) {
    //       console.log("Inside Match Found block");
    //       setMatchFound(true);
    //       setOpponentName(opponentName);
    //       toast.success(`You successfully matched with ${opponentName}`);

    //       // Initialize room ID
    //       setRoomId(roomId);

    // Initialize Socket.IO Connection
    socket = socketIOClient(ENDPOINT);
    socket.emit("joinRoom", roomId);

    socket.on("updateScores", (scores) => {
      const myScore = scores[socket.id] || 0;
      let opponentScore = 0;

      for (const [playerId, playerScore] of Object.entries(scores)) {
        if (playerId !== socket.id) {
          opponentScore = playerScore;
          break;
        }
      }

      setRunningAverageScore(myScore);
      setOpponentScore(opponentScore);
    });
    socket.on("status", (message) => {
      // Show toast with the message "Looking for a match..."
      toast.info(message);
    });

    socket.on("matchFound", ({ opponentName }) => {
      setMatchFound(true);
      setOpponentName(opponentName);
      toast.success(`You successfully matched with ${opponentName}`);
    });

    socket.on("disconnect", () => {
      socket.emit("leaveRoom", roomId);
    });

    // Listen for opponent's disconnection
    socket.on("opponentDisconnected", () => {
      toast.warning("Your opponent has left the game.");
      setMatchFound(false); // Change to "looking for a match"
      // You can navigate user to a different route here if needed
    });

    // Listen for opponent's actions
    socket.on("opponentAction", ({ index, selectedOption }) => {
      setOpponentCurrentIndex(index);
      setOpponentSelectedOption(selectedOption);
    });
    socket.on("opponentDisconnected", () => {
      toast.warning("Your opponent has left the game.");
      setMatchFound(false); // set to false so that user knows that the opponent has left
      // Consider redirecting the user to another page or setting the game state to show that it's waiting for another player.
    });

    // Clean up Socket.IO connection when component unmounts
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) {
      toast.error("You must select an answer to continue!");
      return;
    }

    const { type } = questions[currentIndex];
    let newNumOfCorrectAnswers = numOfCorrectAnswers;
    let newNumOfWrongAnswers = numOfWrongAnswers;

    if (type === selectedOption) {
      newNumOfCorrectAnswers += 1;
      recordAnswer(
        `${currentFact.title} - ${currentFact.description}`,
        selectedOption,
        type
      );
    } else {
      newNumOfWrongAnswers += 1;
      recordAnswer(
        `${currentFact.title} - ${currentFact.description}`,
        selectedOption,
        type
      );
    }

    const totalQuestionsAnswered =
      newNumOfCorrectAnswers + newNumOfWrongAnswers;
    const averageScore =
      (newNumOfCorrectAnswers / totalQuestionsAnswered) * 100;

    setNumOfCorrectAnswers(newNumOfCorrectAnswers);
    setNumOfWrongAnswers(newNumOfWrongAnswers);
    setRunningAverageScore(averageScore);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizEnded(true); // Set quiz to be over
      if (runningAverageScore > opponentScore) {
        setWinner("You");
      } else if (runningAverageScore < opponentScore) {
        setWinner("Opponent");
      } else {
        setWinner("It's a Tie!");
      }
    }

    // Send the averageScore to the server to update the multiplayer score
    axios
      .post("http://localhost:3082/updateScore", {
        roomId: roomId,
        playerId: userId, // Replace this with the actual player ID
        score: averageScore,
      })
      .then((response) => {
        // Handle response (if needed)
      })
      .catch((error) => {
        console.error("Error updating score:", error);
      });

    // Emit score to other players in the room
    socket.emit("sendScore", { roomId, score: averageScore });
  };

  const handleSubmit = () => {
    socket.emit("leaveRoom", roomId);
    setUserResults(runningAverageScore);
    navigate("/results");
    if (token) {
      axios
        .post(
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
        )
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error saving score:", error);
        });
    } else {
      console.error("No token available.");
    }
  };

  const currentFact = questions[currentIndex] || {};
  const { title = "Loading...", description = "Fetching description..." } =
    currentFact;

  const OpponentQuiz = ({ index, selectedOption, questions }) => {
    const currentFact = questions[index] || {};
    const { title = "Loading...", description = "Fetching description..." } =
      currentFact;

    return (
      <div className="opponent-quiz-content">Let's see who is the winner!</div>
    );
  };

  return (
    <div className="quiz-container">
      <ToastContainer theme="light" />
      {opponentName && <p>You are playing with {opponentName}</p>}
      <main className="quiz-content">
        <span>Your Score: {runningAverageScore.toFixed(1)}%</span>
        <span>Opponent's Score: {opponentScore.toFixed(1)}%</span>
        <p>{title}</p>
        <p>{description}</p>
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
        <button onClick={handleSubmit}>End Game and See Results</button>
      </main>
      {matchFound && ( // Render only if a match has been found
        <div className="opponent-quiz">
          {/* New opponent quiz rendering */}
          <OpponentQuiz
            index={opponentCurrentIndex}
            selectedOption={opponentSelectedOption}
            questions={questions}
          />
        </div>
      )}
      {quizEnded && (
        <div className="results-section">
          <h2>Quiz Over!</h2>
          <h3>Winner: {winner}</h3>
          <p>Your final score: {runningAverageScore.toFixed(1)}%</p>
          <p>Opponent's final score: {opponentScore.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

export default CompetitionComponent;
