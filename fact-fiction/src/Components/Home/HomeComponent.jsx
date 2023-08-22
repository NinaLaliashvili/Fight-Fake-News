import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeComponent.css";

const HomeComponent = ({ user }) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const funFacts = [
    "Bananas are berries, but strawberries are not!",
    "Honey never spoils. Sealed honey jars found in the tombs of pharaohs over 3,000 years old are still safe to eat!",
  ];

  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <div className="home-container">
      <header className="header">
        <div className="brand-logo">some logo here </div>
        <nav className="nav">
          {user ? (
            <span>Welcome, {user.name}!</span>
          ) : (
            <button onClick={() => setShowLogin(true)}>Log In</button>
          )}
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
        <button onClick={() => navigate("/quiz")}>Start Game</button>

        <div className="fun-fact">
          <h2>Did you know?</h2>
          <p>
            {randomFact} - now it is hardcoded, but after server side and mongo,
            we will make it better of course, we just need an api route, some
            randome facts on mongo, and api function and thats it. on top of
            that, we can make home page more fun, for example with funny images,
            logos, or animations.
          </p>
        </div>
      </main>

      {showLogin && <div className="login-modal"></div>}
    </div>
  );
};

export default HomeComponent;
