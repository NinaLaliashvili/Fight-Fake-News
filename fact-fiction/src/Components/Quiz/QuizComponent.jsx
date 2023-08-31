import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./QuizComponent.css";
import { userScoreContext } from "../../Context/UserScoreContext";
import { LoginContext } from "../../Context/AuthContext";
import { useSpring, animated } from "@react-spring/web";
import { ToastContainer, toast } from "react-toastify";
import { configBasicAnimation } from "../../helpers/animations";
const cow = require("../Home/cow.png");

const QuizComponent = () => {
  const { userId, token } = useContext(LoginContext);
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

  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:3082/approved-facts")
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching approved facts:", error);
      });
  }, []);

  const notifyUserSelect = (message) => {
    toast.error(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) {
      notifyUserSelect("must select an answer to continue the quest!");
      return;
    }
    let newNumOfCorrectAnswers = numOfCorrectAnswers;
    let newNumOfWrongAnswers = numOfWrongAnswers;

    const { type } = questions[currentIndex];

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
      handleSubmit();
    }
  };

  const handleSubmit = () => {
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

  const currentFact = questions[currentIndex];
  const currentQuestion = currentFact?.title || "Loading...";
  const currentQuestionDescription =
    currentFact?.description || "Fetching description...";

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

  return (
    <div className="quiz-container">
      <ToastContainer theme="light" />

      <main className="quiz-content">
        <span>Score: {runningAverageScore.toFixed(1)}%</span>
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
