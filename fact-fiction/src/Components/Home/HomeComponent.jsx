import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";
import "./HomeComponent.css";

const HomeComponent = () => {
  const { isLoggedIn, setLoginStatus } = useContext(LoginContext);

  const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.removeItem("isLoggedIn");
  //   localStorage.removeItem("userId");
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("firstName");
  //   localStorage.removeItem("lastName");

  //   setLoginStatus(false, null, null);

  //   navigate("/");
  // };

  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  const funFacts = [
    "Bananas are berries, but strawberries are not!",
    "Honey never spoils. Sealed honey jars found in the tombs of pharaohs over 3,000 years old are still safe to eat!",
    "Did you know that you don't actually swallow an average of eight spiders a year in your sleep? 🕷️",
    "Flamingos are naturally white. Their diet of shrimp and algae turns them pink!",
    "Lightning never strikes the same place twice. Myth busted! It can and does, especially tall, pointed, and isolated structures.",
    "Goldfish have a three-second memory, right? Wrong! They can remember things for months.",
  ];

  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <div className="home-container">
      {/* <header className="header">
        <img
          className="brand-logo"
          src="https://cdn.factcheck.org/UploadedFiles/rwjf-icon-conspiracy-01-.png"
          height="50"
        />
        <nav className="nav">
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Log In</button>
              <button onClick={() => navigate("/register")}>Register</button>
            </>
          )}

          <button onClick={() => navigate("/admin")}>Admin</button>
          <button onClick={() => navigate("/leaderboard")}>Leaderboard</button>
          <button onClick={() => navigate("/quiz")}>Quiz Page</button>
          <button onClick={() => navigate("/results")}>Results</button>
          <button onClick={() => navigate("/submit-fact")}>
            Fact Submission
          </button>
        </nav>
      </header> */}

      <main>
        <h2 className="welcome">
          {isLoggedIn
            ? `Hey there, ${firstName} ${lastName}! 🌟 Ready to embark on another journey of myth-busting? Grab your detective hat and let's uncover some truths together! 🕵️‍♂️`
            : `Welcome to Fact or Fiction Fun Quiz. Dive into a world where myths unravel and truths shine. Are you ready?`}
        </h2>
        <button className="start-btn" onClick={() => navigate("/quiz")}>
          Start Game
        </button>

        <div className="fun-fact">
          <h3>Did you know?</h3>
          <p>
            {randomFact} - Welcome to our corner, where interesting stories meet
            the real facts. We've all come across surprising claims, some more
            believable than others. Curious about how well you can separate fact
            from fiction? Try our quizzes and see for yourself. Intrigued? Dive
            in!"
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomeComponent;
