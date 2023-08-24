import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeComponent.css";

const HomeComponent = ({ user }) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

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
      <header className="header">
        <img
          className="brand-logo"
          src="https://cdn.factcheck.org/UploadedFiles/rwjf-icon-conspiracy-01-.png"
          height="50"
        />
        <nav className="nav">
          {user ? (
            <span>Welcome, {user.name}!</span>
          ) : (
            <button
              onClick={() => {
                setShowLogin(true);
                navigate("/login");
              }}
            >
              Log In
            </button>
          )}
          <button onClick={() => navigate("/register")}>Register</button>
          <button onClick={() => navigate("/leaderboard")}>Leaderboard</button>
          <button onClick={() => navigate("/quiz")}>Quiz Page</button>
          <button onClick={() => navigate("/results")}>Results</button>
          <button onClick={() => navigate("/submit-fact")}>
            Fact Submission
          </button>
        </nav>
      </header>

      <main>
        <h2>
          Welcome to Fact or Fiction Fun Quiz. Test your knowledge and see if
          you can differentiate between facts and myths. Good luck! (This is
          some welcoming letter for user, we can think about smth more
          creative/fun text, with images/animations)
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

      {showLogin && <div className="login-modal"></div>}
    </div>
  );
};

export default HomeComponent;
