import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./QuizComponent.css";
import { userScoreContext } from "../../Context/UserScoreContext";
import socketIOClient from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import { LoginContext } from "../../Context/AuthContext";
import { useSpring, animated } from "@react-spring/web";

const ENDPOINT = "http://localhost:3082";
let socket;

const CompetitionComponent = () => {
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

  const [isLoading, setIsLoading] = useState(true);
  const [opponentName, setOpponentName] = useState("");
  const [yourScore, setYourScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState("");
  const { userId, token } = useContext(LoginContext);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roomId, setRoomId] = useState("room1"); // hardcoded for simplicity
  const [opponentCurrentIndex, setOpponentCurrentIndex] = useState(0);
  const [opponentSelectedOption, setOpponentSelectedOption] = useState(null);
  const [matchFound, setMatchFound] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3082/approved-facts")
      .then((response) => {
        const allQuestions = response.data;
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 10));
      })
      .catch((error) => {
        console.error("Error fetching approved facts:", error);
      });

    socket = socketIOClient(ENDPOINT);

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
      console.log("Received Scores:", data);
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
    // if (isCorrect) {
    //   setYourScore((prevScore) => prevScore + 1);
    // }
    socket.emit("answer", { isCorrect, userId });
  };

  const handleEndGame = () => {
    socket.emit("endGame", userId);
  };

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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizComplete(true);
      handleSubmit();
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
      handleSubmit();
    }

    // Send the averageScore to the server to update the multiplayer score
    axios
      .post("http://localhost:3082/updateScore", {
        roomId: roomId,
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
    setUserResults(runningAverageScore);
    // navigate("/results");

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

  const currentFact = questions[currentIndex];
  const currentQuestion = currentFact?.title || "Loading...";
  const currentQuestionDescription =
    currentFact?.description || "Fetching description...";
  const currentImg = currentFact?.imgLink || "fetching image";

  return (
    <div className="quiz-containerr">
      <ToastContainer />
      <h1>Quiz Game</h1>
      {isLoading ? (
        <p>Waiting for other user to join...</p>
      ) : (
        <>
          <div>
            {opponentName && <p>You are playing with {opponentName}</p>}
          </div>
          <div>
            <main className="quiz-content">
              <span>Your Score: {runningAverageScore.toFixed(1)}%</span>
              <span>Opponent's Score: {"opponents score".toFixed(1)}%</span>
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
              {quizComplete ? (
                <p>You are done</p>
              ) : (
                <button onClick={handleNext}>Next</button>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default CompetitionComponent;
