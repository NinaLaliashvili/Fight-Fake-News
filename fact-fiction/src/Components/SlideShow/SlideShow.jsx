import React, { useState } from "react";
import "./SlideShow.css";

const facts = [
  {
    fact: "The shortest war in history lasted 38 minutes.",
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/013/261/020/small/world-war-two-battle-tank-firing-cannon-png.png",
  },
  {
    fact: "Honey never spoils. Sealed honey jars found in tombs over 3,000 years old are still safe to eat.",
    image:
      "https://www.freepnglogos.com/uploads/honey-png/honey-flowing-transparent-png-stickpng-39.png",
  },
  {
    fact: "The longest time between two twins being born is 87 days.",
    image:
      "https://www.pngmart.com/files/17/Twin-Sister-Transparent-Background.png",
  },
  {
    fact: "The unicorn is the national animal of Scotland.",
    image: "https://clipart-library.com/img/1546087.png",
  },
  {
    fact: "A day on Venus is longer than a year on Venus.",
    image:
      "https://images.vexels.com/media/users/3/239492/isolated/preview/ae36a88728be8e1f8b3596007d1123b0-planet-color-doodle.png",
  },
  {
    fact: "The Great Wall of China is not visible from the Moon with the naked eye.",
    image:
      "https://www.pngarts.com/files/18/Great-Wall-Of-China-Transparent-Images.png",
  },
  {
    fact: "An octopus has three hearts.",
    image: "https://pngimg.com/d/octopus_PNG41.png",
  },
  {
    fact: "Polar bears have black skin underneath their thick layer of fur.",
    image:
      "https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/3169214/polar-clipart-md.png",
  },
  {
    fact: "The Eiffel Tower can grow taller by up to 6 inches during the summer because of thermal expansion.",
    image:
      "https://i.pinimg.com/originals/dc/6b/5b/dc6b5b88da811cf81dada985051ffe79.png",
  },
  {
    fact: "Bananas are berries, but strawberries aren’t.",
    image:
      "https://www.oikos.ca/sites/default/files/product/2020-08/oikos_fraise-banane_0.png",
  },
  {
    fact: "Cows have best friends and can become stressed when they are separated from them.",
    image:
      "https://www.deheuskidzz.com/siteassets/cattle/de-heus-koeien-twee-groot-formaat.png",
  },
  {
    fact: "Sharks are the only fish that can blink with both eyes.",
    image: "https://www.pngmart.com/files/16/Blue-Real-Shark-PNG-Image.png",
  },
  {
    fact: "Humans and giraffes have the same number of neck vertebrae: seven.",
    image:
      "https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/17645/confused-giraffe-face-clipart-md.png",
  },
  {
    fact: "The average person will spend six months of their life waiting for red lights to turn green.",
    image: "https://freepngimg.com/thumb/categories/1906.png",
  },
  {
    fact: "Cleopatra lived closer in time to the moon landing than to the construction of the Great Pyramids of Giza.",
    image: "https://cdn-icons-png.flaticon.com/512/5498/5498690.png",
  },
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
      <h2 className="random"> Random Fun Facts</h2>
      {facts.map((fact, index) => (
        <div
          className={`slide ${index === currentSlide ? "active" : ""}`}
          key={index}
        >
          <p>{fact.fact}</p>
          <div>{fact.image && <img src={fact.image} alt={fact.fact} />}</div>
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
