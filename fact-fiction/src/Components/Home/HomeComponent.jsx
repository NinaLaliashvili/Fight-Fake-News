import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";
import "./HomeComponent.css";
import { SlideShow } from "../SlideShow/SlideShow";

const HomeComponent = () => {
  const { isLoggedIn } = useContext(LoginContext);

  const navigate = useNavigate();

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
      <main>
        <section className="hero">
          <h2 className="hero-text">
            {isLoggedIn
              ? `Hey there, ${firstName} ${lastName}! 🌟
             Ready to embark on another journey of myth-busting? Grab your detective hat and let's uncover some truths together! 🕵️‍♂️`
              : `Welcome to Fact or Fiction Fun Quiz. Dive into a world where myths unravel and truths shine. Are you ready?`}
          </h2>
          <button className="start-btn" onClick={() => navigate("/quiz")}>
            Start Game
          </button>

          <img
            src="https://celiacfacts-onlinecourses.eu/pluginfile.php/955/mod_lesson/page_contents/259/F9U4_MythRealityHeaderENG.png"
            alt="Fact vs Myth"
            className="hero-image"
          />
        </section>

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

        <SlideShow />
      </main>
    </div>
  );
};

export default HomeComponent;
