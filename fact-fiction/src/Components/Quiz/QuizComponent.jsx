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

  const [selectedOption, setSelectedOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Random");
  const [feedbackText, setFeedbackText] = useState(null);
  const [feedbackClass, setFeedbackClass] = useState("");

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
    if (!selectedOption) {
      notifyUserSelect("You must select an answer to continue the quiz!");
      return;
    }

    if (!currentFact) {
      console.error("Current fact is undefined");
      return;
    }

    let newNumOfCorrectAnswers = numOfCorrectAnswers;

    const { type } = currentFact;

    if (type === selectedOption) {
      newNumOfCorrectAnswers += 1;
    }

    if (selectedOption === currentFact?.type) {
      setFeedbackText("Correct! Well done.");
      setFeedbackClass("feedback-text-correct");
    } else {
      setFeedbackText("Oops! That was incorrect.");
      setFeedbackClass("feedback-text-incorrect");
    }

    recordAnswer(
      `${currentFact.title} - ${currentFact.description}`,
      selectedOption,
      type
    );

    setNumOfCorrectAnswers(newNumOfCorrectAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setUserResults(numOfCorrectAnswers);
    navigate("/results");

    if (token) {
      console.log("Token: ", token);
      axios
        .post(
          "http://localhost:3082/save-score",
          {
            userId: userId,
            score: numOfCorrectAnswers,
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

      <main className="quiz-content">
        <h1 className="quiz-header">
          The Quiz Arena is Open: Go ahead if You Dare!
        </h1>
        <div className="scoreboard">
          <span className="score-yourr">Score: {numOfCorrectAnswers}</span>
          <p className={feedbackClass}>{feedbackText}</p>
        </div>
        <p className="current-question">{currentQuestion}</p>
        <p className="current-question">{currentQuestionDescription}</p>
        <div className="center">
          <div>
            <img
              className="immmg"
              src={currentImg}
              alt={`well ur img didn't load but it is of ${currentQuestion}`}
            />
          </div>
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

          <button onClick={handleSubmit}>End Game and See Results</button>
        </div>
      </main>
    </div>
  );
};

export default QuizComponent;
