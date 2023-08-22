import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SubmitFactComponent = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  // form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [type, setType] = useState("fact"); // default to 'fact'

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here, you'd typically send this data to your server
    // For now, just setting submitted to true to show the thank you message

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="thank-you-container">
        <h2>Thank you for your submission!</h2>
        <p>
          We've received your fact/theory. We will review it and get back to you
          soon. Remember, accuracy and truth are crucial!
        </p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="submission-container">
      <header>
        <h1>QuizMaster</h1>

        <nav>
          <button onClick={() => navigate("/")}>Home</button>
          {/* Add other navigation links if required */}
        </nav>
      </header>
      <main>
        <h3>
          On this page we need more creative things, not only the form, the list
          of important subjects is into{" "}
          <a
            href="https://docs.google.com/document/d/1AFEvLqQ2tzKPoL60fnX5GIA75TtSsylmayK4SD6XWSI/edit"
            target="blank"
          >
            google docs,
          </a>
          what i've shared to you. just in case: Fact Submission page
          (SubmitFactComponent): 1) App name Navigation links Description : “got
          a cool fact or conspiracy theory to share? Let us know” - or something
          like that. 2) fact/conspiracy theory title. Description or full text.
          3) Source link (should be optional but recommended) 4) User full name
          Email (with a note that it is for notification purposes)5) Mobile
          number (optional but can be useful)6) Dropdown or radio buttons for
          choosing fact or fiction Input field for the source link Textarea for
          the statement. 7)Submit button. 8)A thank you message (we got your
          fact, we will contact you soon or something) and a quick note about
          the importance of accuracy and truth
        </h3>
        <h2>Got a cool fact or conspiracy theory to share? Let us know!</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fact/Theory Title"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description or full text"
            required
          />
          <input
            type="text"
            value={sourceLink}
            onChange={(e) => setSourceLink(e.target.value)}
            placeholder="Source link (Recommended)"
          />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (For notifications)"
            required
          />
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Mobile Number (Optional)"
          />
          <div>
            <label>
              <input
                type="radio"
                value="fact"
                checked={type === "fact"}
                onChange={() => setType("fact")}
              />
              Fact
            </label>
            <label>
              <input
                type="radio"
                value="fiction"
                checked={type === "fiction"}
                onChange={() => setType("fiction")}
              />
              Fiction
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
      </main>
    </div>
  );
};

export default SubmitFactComponent;
