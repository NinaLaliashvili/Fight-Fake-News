import React, { useState } from "react";
import "./SlideShow.css";

const facts = [
  {
    fact: "The shortest war in history lasted 38 minutes.",
    image:
      "https://st2.depositphotos.com/1526816/8274/v/950/depositphotos_82746490-stock-illustration-doodle-sport-sword-fighting.jpg",
  },
  {
    fact: "Honey never spoils. Sealed honey jars found in tombs over 3,000 years old are still safe to eat.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlXEGC6IoD6E1msoeHh6wBT-ubTQ1AqAQxZg&usqp=CAU",
  },
  {
    fact: "The longest time between two twins being born is 87 days.",
    image:
      "https://twinmania.co.uk/wp-content/uploads/2016/03/Identical-Babies-01.jpg",
  },
  {
    fact: "The unicorn is the national animal of Scotland.",
    image:
      "https://img.freepik.com/free-vector/hand-drawn-cute-unicorn-doodle-style-beige-background-vector_53876-173397.jpg?w=2000",
  },
  {
    fact: "A day on Venus is longer than a year on Venus.",
    image:
      "https://i.pinimg.com/736x/07/ab/ee/07abee482dafb154ef5707216008a743.jpg",
  },
  {
    fact: "The Great Wall of China is not visible from the Moon with the naked eye.",
    image:
      "https://cdn2.vectorstock.com/i/1000x1000/63/71/great-wall-china-in-cartoon-style-isolated-vector-38586371.jpg",
  },
  {
    fact: "An octopus has three hearts.",
    image:
      "https://static.vecteezy.com/system/resources/previews/007/644/840/original/hand-drawn-octopus-doodle-clipart-for-nursery-prints-posters-cards-stickers-kids-apparel-decor-sublimation-etc-eps-10-vector.jpg",
  },
  {
    fact: "Polar bears have black skin underneath their thick layer of fur.",
    image:
      "https://as1.ftcdn.net/v2/jpg/02/26/70/56/1000_F_226705615_lovcwEY5JfGUtqhzz0iAmEWYOATZ5goh.jpg",
  },
  {
    fact: "The Eiffel Tower can grow taller by up to 6 inches during the summer because of thermal expansion.",
    image:
      "https://www.creativefabrica.com/wp-content/uploads/2021/11/22/1637568440/Doodle-Eiffel-tower.jpg",
  },
  {
    fact: "Bananas are berries, but strawberries aren’t.",
    image:
      "https://img.myloview.com/stickers/banana-strawberry-and-mint-colorful-line-sketch-collection-of-fruits-and-berries-isolated-on-white-background-doodle-hand-drawn-fruits-vector-illustration-700-252917426.jpg",
  },
  {
    fact: "Cows have best friends and can become stressed when they are separated from them.",
    image:
      "https://img.freepik.com/premium-vector/two-cows-vector-print-doodle_629110-172.jpg?w=2000",
  },
  {
    fact: "Sharks are the only fish that can blink with both eyes.",
    image:
      "https://img.freepik.com/premium-vector/colored-shark-doodle-simple-vector-illustration-vector-illustration_639772-51.jpg?w=2000",
  },
  {
    fact: "Humans and giraffes have the same number of neck vertebrae: seven.",
    image:
      "https://static.vecteezy.com/system/resources/previews/005/533/707/original/cute-hand-drawn-doodle-giraffe-illustration-with-cartoon-style-vector.jpg",
  },
  {
    fact: "The average person will spend six months of their life waiting for red lights to turn green.",
    image:
      "https://static.vecteezy.com/system/resources/previews/012/888/955/original/traffic-light-doodle-sketch-hand-drawn-style-icon-illustration-free-vector.jpg",
  },
  {
    fact: "Cleopatra lived closer in time to the moon landing than to the construction of the Great Pyramids of Giza.",
    image:
      "https://i.pinimg.com/474x/d0/8a/ae/d08aae663640225aa855f0b11a12371e.jpg",
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
      <h2> Random Fun Facts</h2>
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
