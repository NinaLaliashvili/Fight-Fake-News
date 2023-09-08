import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./QuizComponent.css";
import { userScoreContext } from "../../Context/UserScoreContext";
import socketIOClient from "socket.io-client";
import { LoginContext } from "../../Context/AuthContext";
import { useSpring, animated } from "@react-spring/web";
import { ToastContainer, toast } from "react-toastify";
import { configBasicAnimation } from "../../helpers/animations";
import { useNavigate } from "react-router-dom";

const cow = require("../Home/cow.png");

const ENDPOINT = "http://localhost:3082";
let socket;
let roomId;

const CompetitionComponent = () => {
  const navigate = useNavigate();
  const { userId, token, username } = useContext(LoginContext);
  // const navigate = useNavigate();
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

  const categories = [
    "Random",
    "Science",
    "History",
    "Entertainment",
    "Geography",
    "Politics",
    "Conspiracy",
    "Culture",
    "Religion",
  ];

  const [selectedCategory, setSelectedCategory] = useState("Random");
  const [isLoading, setIsLoading] = useState(true);
  const [opponentName, setOpponentName] = useState("");
  const [yourScore, setYourScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roomId, setRoomId] = useState("room1"); // hardcoded for simplicity
  const [opponentCurrentIndex, setOpponentCurrentIndex] = useState(0);
  const [opponentSelectedOption, setOpponentSelectedOption] = useState(null);
  const [matchFound, setMatchFound] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [userResults, setUserResult] = useState({
    winner: null,
    yourScore: null,
    opponentScore: null,
  });
  const [navigateToQuiz, setNavigateToQuiz] = useState(false);

  useEffect(() => {
    console.log("Initial useEffect triggered");
    axios
      .get("http://localhost:3082/approved-facts")
      .then((response) => {
        const allQuestions = response.data;
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 10));
      })
      .catch((error) => {
        console.error("Error fetching approved facts:", error);
        setIsLoading(false);
        // maybe set some error state here to indicate the failure in your UI
      });
    socket = socketIOClient(ENDPOINT, { query: { userId, token } });
    socket.on("connect", () => {
      socket.emit("enterMatch", userId);
    });

    socket.on("waiting", (data) => {
      setRoomId(data.roomId);
      setIsLoading(true);
    });

    socket.on("matched", (data) => {
      setRoomId(data.roomId);
      setIsLoading(false);
      setOpponentName(data.opponentName);
      toast.success(`You are matched with ${data.opponentName}`);
    });

    socket.on("scoreUpdate", (data) => {
      if (data.yourScore !== undefined) {
        setYourScore(data.yourScore);
      }

      if (data.opponentScore !== undefined) {
        setOpponentScore(data.opponentScore);
      }
    });

    socket.on("endGame", ({ winner, player1Score, player2Score }) => {
      console.log("Game ended");
      console.log("Winner: ", winner);
      console.log("Player 1 Score: ", player1Score);
      console.log("Player 2 Score: ", player2Score);
      setQuizEnded(true);
      setUserResult({
        winner,
        yourScore: player1Score, // Adjust this according to who the player is
        opponentScore: player2Score, // Adjust this according to who the player is
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const fetchQuestionsByCategory = (category) => {
    let apiUrl = "http://localhost:3082/approved-facts";

    if (category !== "Random") {
      apiUrl += `?category=${category}`;
    }

    axios
      .get(apiUrl)
      .then((response) => {
        const allQuestions = response.data;
        if (!allQuestions) {
          return;
        }
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 10));
      })
      .catch((error) => {
        console.error("Error fetching approved facts:", error);
      });
  };

  useEffect(() => {
    fetchQuestionsByCategory(selectedCategory);
  }, [selectedCategory]);

  const notifyUserSelect = (message) => {
    toast.error(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    console.log("handleNext triggered");
    const currentFact = questions[currentIndex];

    if (!currentFact) {
      console.error("currentFact is undefined");
      return;
    }
    if (!selectedOption) {
      notifyUserSelect("must select an answer to continue the quest!");
      return;
    }
    let newNumOfCorrectAnswers = numOfCorrectAnswers;
    let newNumOfWrongAnswers = numOfWrongAnswers;

    const { type } = questions[currentIndex];

    let isCorrect = selectedOption === type;
    socket.emit("answer", { isCorrect, roomId });

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

    if (type === selectedOption) {
      newNumOfCorrectAnswers += 1;
      recordAnswer(
        `${currentFact.title} - ${currentFact.description}`,
        selectedOption,
        type
      );
      socket.emit("answer", { isCorrect: true, roomId });
    } else {
      newNumOfWrongAnswers += 1;
      recordAnswer(
        `${currentFact.title} - ${currentFact.description}`,
        selectedOption,
        type
      );
      socket.emit("answer", { isCorrect: false, roomId });
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    socket.emit("endGame");
  };

  const currentFact = questions[currentIndex];
  const currentQuestion = currentFact?.title || "Loading...";
  const currentQuestionDescription =
    currentFact?.description || "Fetching description...";
  const currentImg = currentFact?.imgLink || "fetching image";

  const springsUpDown = useSpring({
    from: { y: 0, x: 0 },
    to: async (next, cancel) => {
      await next({ y: 5 });
      await next({ x: 5 });
      await next({ y: 0 });
      await next({ x: 10 });
      await next({ y: 5 });
      await next({ x: 15 });
      await next({ x: 0 });
    },
    loop: true,
    config: configBasicAnimation,
  });

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
    fetchQuestionsByCategory(category);
  };

  if (quizEnded) {
    return (
      <div className="winner-section">
        <h2>Game Ended</h2>
        <p className="winner-announcement">
          <span className="trophy-icon">🏆</span>
          Winner: <span className="winner-name">{userResults.winner}</span>
        </p>
        <div className="score-board">
          <p>
            Your Score: <span className="score">{yourScore.toFixed(1)}%</span>
          </p>
          <p>
            Opponent's Score:{" "}
            <span className="score">{opponentScore.toFixed(1)}%</span>
          </p>
        </div>
        <button className="play-again-button" onClick={() => navigate("/quiz")}>
          Play again
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <aside className="sidebar">
        <h4 className="sidebar-header">Pick a Category</h4>
        <ul className="category-list">
          {categories.map((category) => (
            <li
              key={category}
              className={`category-item ${
                selectedCategory === category ? "active-category" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </aside>
      <ToastContainer theme="light" />
      <div className="main-content">
        <h1 className="quiz-header">Quiz Game</h1>
        {opponentName && !isLoading && (
          <div className="opponent-banner">
            <h2>
              {opponentName
                ? `You are playing with ${opponentName.split(" ")[0]} now`
                : ""}
            </h2>
            <p className="think">
              Think fast! If your opponent finishes before you, the game ends
              for both players. Don't let them beat you to it! 💨
            </p>
          </div>
        )}
        <div>
          {isLoading ? (
            <div className="loading-container">
              <p>Waiting for other user to join...</p>
            </div>
          ) : (
            <>
              <main className="quiz-content">
                {/* <span>Score: {runningAverageScore.toFixed(1)}%</span> */}
                <div className="scoreboard">
                  <p className="score-your">
                    Your Score: <span>{yourScore.toFixed(1)}%</span>
                  </p>
                  <p className="score-opponent">
                    Opponent's Score: <span>{opponentScore.toFixed(1)}%</span>
                  </p>
                </div>
                <p className="current-question">{currentQuestion}</p>
                <p className="current-question">{currentQuestionDescription}</p>
                <div className="options">
                  <div className="center">
                    <div>
                      <img
                        className="immmg"
                        src={currentImg}
                        alt={`well ur img didn't load but it is of ${currentQuestion}`}
                      />
                    </div>
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
                    <span>
                      <animated.img
                        src={cow}
                        alt="cow"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 4,
                          ...springsUpDown,
                        }}
                        onClick={() =>
                          notifyUserSelect(
                            "no bullshit plz u can't touch this; knowledge comes in three's so where are you going 'to'? think literally"
                          )
                        }
                      />
                    </span>
                  </div>
                  <button onClick={handleNext}>Next</button>

                  <button onClick={handleSubmit}>
                    End Game and See Results
                  </button>
                </div>
              </main>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionComponent;
