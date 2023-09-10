import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../Context/AuthContext";
import "./HomeComponent.css";
import { SlideShow } from "../SlideShow/SlideShow";
import { useSpring, animated, easings } from "@react-spring/web";
import {
  configBasicAnimation,
  configDanceAnimation,
  configFlyAnimation,
} from "../../helpers/animations";
import { ToastContainer, toast } from "react-toastify";
const alienImage = require("./alien.png");

const chart = require("./graph.png");
const cuteCow = require("./cow.png");
const fox = "https://clipart-library.com/img/2100422.jpg";

const HomeComponent = () => {
  const { isLoggedIn, avatar } = useContext(LoginContext);

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
      await next({ x: 4, y: 2 });
      await next({ x: -4, y: -2 });
    },
    loop: true,
    config: configFlyAnimation,
  });

  const springsUpDown = useSpring({
    from: { y: 0, x: 0 },
    to: async (next, cancel) => {
      await next({ y: 5 });
      await next({ y: -2 });
    },
    loop: true,
    config: configBasicAnimation,
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
  });

  const notifyUserPlay = (message) => {
    toast.success(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  useEffect(() => {
    console.log("Avatar URL updated:", avatar);
  }, [avatar]);

  return (
    <div className="home-container">
      <ToastContainer theme="light" />
      <main>
        <section className="hero">
          <h2 className="hero-text">
            {isLoggedIn ? (
              <>
                <div
                  className="user-avatar"
                  style={{
                    position: "relative",
                    width: "100px",
                    height: "100px",
                  }}
                >
                  <img
                    className="avatar"
                    src={avatar}
                    alt="User Avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: "2px solid #fff",
                      boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="heyyy">
                  {`Hey there, ${firstName} ${lastName}! `}
                  🌟 Ready to embark on an information journey? Quest time! Grab
                  your detective hat and let's uncover some truths together! 🕵️‍♂️
                </div>
              </>
            ) : (
              `Welcome to Fact or Fiction Fun Quiz. Dive into a world where myths unravel and truths shine. Are you ready? Play as a guest user, login, or register today!`
            )}
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

          <img src={alienImage} alt="Fact vs Myth" className="hero-image" />
        </section>
        <SlideShow />
        <div className="fun-fact">
          <h3>Did you know? 🧐</h3>
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
                    "heyyy yes that's bullsh*t! fake news sucks! Curious for the truth? Step one is: Take a letter! h"
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
            social media giants won't do anything to solve the issue.
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
            least once! And the amount of fake news is only expected to increase
            as new technologies become mainstream, like generative AI. Even
            worse- people overestimate their ability to identify fake news. The
            worse they are at spotting it, the more likely they are to share it!
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
                Source..
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
                notifyUserPlay(
                  "you caught on! Now play our game! And for when you want to reveal a mystery... step two is remember, aha"
                )
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
      </main>
    </div>
  );
};

export default HomeComponent;
