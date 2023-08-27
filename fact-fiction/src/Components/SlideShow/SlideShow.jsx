import React, { useState } from "react";
import "./SlideShow.css";

const facts = [
  "The shortest war in history lasted 38 minutes.",
  "Honey never spoils. Sealed honey jars found in tombs over 3,000 years old are still safe to eat.",
  "The longest time between two twins being born is 87 days.",
  "The unicorn is the national animal of Scotland.",
  "A day on Venus is longer than a year on Venus.",
  "The Great Wall of China is not visible from the Moon with the naked eye.",
  "An octopus has three hearts.",
  "Polar bears have black skin underneath their thick layer of fur.",
  "The Eiffel Tower can grow taller by up to 6 inches during the summer because of thermal expansion.",
  "Bananas are berries, but strawberries aren’t.",
  "Cows have best friends and can become stressed when they are separated from them.",
  "Sharks are the only fish that can blink with both eyes.",
  "The word “alphabet” comes from the first two letters of the Greek alphabet: alpha and beta.",
  "Humans and giraffes have the same number of neck vertebrae: seven.",
  "The smell of freshly-cut grass is actually a plant distress call.",
  "There are more possible iterations of a game of chess than there are atoms in the known universe.",
  "Vending machines are more likely to kill someone than a shark is.",
  "The average person will spend six months of their life waiting for red lights to turn green.",
  "A jiffy is a real unit of time: 1/100th of a second.",
  "Cleopatra lived closer in time to the moon landing than to the construction of the Great Pyramids of Giza.",
];

export const SlideShow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % facts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prevSlide) => (prevSlide - 1 + facts.length) % facts.length
    );
  };

  return (
    <div className="slideshow-container">
      {facts.map((fact, index) => (
        <div
          className={`slide ${index === currentSlide ? "active" : ""}`}
          key={index}
        >
          <p>{facts[index]}</p>
        </div>
      ))}
      <button onClick={prevSlide} className="prev">
        &#10094;
      </button>
      <button onClick={nextSlide} className="next">
        &#10095;
      </button>
    </div>
  );
};
