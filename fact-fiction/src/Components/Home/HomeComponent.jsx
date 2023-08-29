import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";
import "./HomeComponent.css";
import { SlideShow } from "../SlideShow/SlideShow";
import { useSpring, animated, easings } from "@react-spring/web";

import { ToastContainer, toast } from "react-toastify";

const chart = require("./graph.png");
const cuteCow = require("./cow.png");
const fox = "https://clipart-library.com/img/2100422.jpg";

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

  const springsSideToSide = useSpring({
    from: { y: 0, x: 0 },
    to: async (next, cancel) => {
      await next({ x: 2 });
    },
    loop: true,
  });

  const springsUpDown = useSpring({
    from: { y: 0, x: 0 },
    to: async (next, cancel) => {
      await next({ y: 5 });
      await next({ y: -2 });
    },
    loop: true,
    config: {
      tension: 170,
      mass: 1,
      friction: 30,
      velocity: 0.1,
      precision: 0.01,
    },
  });

  const springsChase = useSpring({
    from: { y: 60, x: 0 },
    to: async (next, cancel) => {
      await next({ x: 20 });
      await next({ y: 0 });
      await next({ y: 20 });
      await next({ x: 40 });
      await next({ y: 30, x: 20 });
    },
    loop: true,
    config: {
      tension: 130,
      mass: 1,
      friction: 20,
      velocity: 0.85,
      precision: 0.01,
      frequency: 1,
      round: 4,
    },
  });

  const springsSmallSquare = useSpring({
    from: { y: 0, x: 0 },
    to: async (next, cancel) => {
      await next({ x: 40 });
      await next({ y: -2 });
      await next({ x: 0 });
      await next({ y: 0 });
    },
    loop: true,
    // config: {
    //   tension: 80,
    //   mass: 1.2,
    //   friction: 20,
    //   velocity: 0.3,
    //   precision: 0.01,
    // },
  });

  const notifyUserPlay = (message) => {
    toast.success(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  return (
    <div className="home-container">
      <ToastContainer theme="light" />
      <main>
        <section className="hero">
          <h2 className="hero-text">
            {isLoggedIn
              ? `Hey there, ${firstName} ${lastName}! 🌟
             Ready to embark on an information journey? Quest time! Grab your detective hat and let's uncover some truths together! 🕵️‍♂️`
              : `Welcome to Fact or Fiction Fun Quiz. Dive into a world where myths unravel and truths shine. Are you ready?`}{" "}
            <span>
              <animated.img
                src={fox}
                alt="cow"
                style={{
                  width: 22,
                  height: 23,
                  borderRadius: 4,
                  ...springsSideToSide,
                }}
              />
            </span>
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
            {randomFact} - Welcome to our corner, where false claims meet the
            real facts. We've all come across surprising claims, some more
            believable than others. Curious about how well you can separate fact
            from fiction? See for yourself- dive in!
          </p>
        </div>

        <div className="fun-fact">
          <h3>
            How much does all the bs{" "}
            <span>
              <animated.img
                src={cuteCow}
                alt="cow"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 4,
                  ...springsUpDown,
                }}
                onClick={() =>
                  notifyUserPlay(
                    "heyyy yes that's bullsh*t! fake news sucks! play the game"
                  )
                }
              />
            </span>{" "}
            fake news freaking suck?!{" "}
          </h3>

          <p>
            Did you know that the very design of social media platforms is part
            of the problem? The reward structure of social media itself is a big
            contributor to the spread of fake news- helping fictitious claims
            rise to the top! It's up to us to sharpen our skills since the
            social media giants won't do anything to mitigate the issue.
          </p>
          <a
            target="blank"
            href="https://news.usc.edu/204782/usc-study-reveals-the-key-reason-why-fake-news-spreads-on-social-media/"
          >
            Source..
          </a>
        </div>

        <div className="fun-fact">
          <h3>
            Fake news is everywhere...{" "}
            <span>
              <animated.img
                src={fox}
                alt="fox"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  ...springsSideToSide,
                }}
                onClick={() =>
                  notifyUserPlay(
                    "it's shocking isn't it? wanna be foxy like me? triangulate your sources!"
                  )
                }
              />
            </span>{" "}
            Learn to be a foxy internet user!
          </h3>
          <p>
            86% of global internet users have been exposed to fake news. Among
            those users- nearly 90% have thought fake news was real at first- at
            least once. That's a lot going around! And the barrage of fake news
            is only expected to increase as new technologies become mainstream,
            like generative AI. Even worse- people overestimate their ability to
            identify fake news. The worse they are at spotting it, the more
            likely they are to share it!
          </p>
          <a
            target="blank"
            href="https://www.statista.com/topics/3251/fake-news/#topicOverview"
          >
            Source..
          </a>
          <a
            target="blank"
            href="https://www.cnn.com/2021/05/31/health/fake-news-study/index.html"
          >
            And another source for good measure..
          </a>
          <a
            target="blank"
            href="https://www.ipsos.com/en-us/news-polls/cigi-fake-news-global-epidemic"
          >
            A third source: triangulate sources!
          </a>
        </div>

        <div className="fun-fact">
          <h3>
            Be foxy online! Here are the fake news culprits.. chase the truth!{" "}
            <span>
              <a
                target="blank"
                href="https://www.ipsos.com/en-us/news-polls/cigi-fake-news-global-epidemic"
              >
                Aaaand source..
              </a>
            </span>
          </h3>
          <div className="in-line">
            <animated.img
              src={chart}
              alt="chart showing fake news disseminators"
              style={{
                width: 400,
                height: 300,
                borderRadius: 8,
                ...springsSmallSquare,
              }}
              onClick={() =>
                notifyUserPlay("you caught on! Now play our game!")
              }
            />
            <animated.img
              src={fox}
              alt="cow"
              style={{
                width: 100,
                height: 100,
                borderRadius: 4,
                ...springsChase,
              }}
              onClick={() =>
                notifyUserPlay("okay foxy person! Now play our game!")
              }
            />
          </div>
        </div>

        <SlideShow />
      </main>
    </div>
  );
};

export default HomeComponent;
