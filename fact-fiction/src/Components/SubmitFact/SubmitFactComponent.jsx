import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "./SubmitFactComponent.css";

const SubmitFactComponent = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [type, setType] = useState("fact");
  const [category, setCategory] = useState("");

  const categories = [
    "Random",
    "Science",
    "History",
    "Entertainment",
    "Geography",
    "Politics",
    "Conspiracy",
    "Culture",
    "Religion",
  ];

  const notifyUser = (message) => {
    toast.error(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const notifySuccess = (message) => {
    toast.success(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const factData = {
      title,
      description,
      sourceLink,
      fullName,
      email,
      mobileNumber,
      type,
      category,
    };

    fetch("http://localhost:3082/submit-fact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(factData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fact submission successful:", data);
        setSubmitted(true);
        notifySuccess("fact submitted! yay!");
      })
      .catch((error) => {
        console.error("Error submitting fact:", error);
        notifyUser(`issue submitting fact: ${error}`);
      });
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
      <ToastContainer theme="light" />
      {/* <header>
        <h1>Fact Submission</h1>

        <nav>
          <button onClick={() => navigate("/")}>Home</button>
        </nav>
      </header> */}
      {!submitted ? (
        <main>
          <h3 className="center, bla">
            Got a cool fact or conspiracy theory to share? We're all ears! Dive
            in and let us know your interesting truths or theories. But before
            you do, remember:
            <br />
            <span style={{ textDecoration: "underline" }}>
              Accuracy matters!
            </span>{" "}
            Ensure your submissions are truthful and backed by genuine sources.
          </h3>
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
            <select
              id="categorySelect"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">--Select a Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>

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
            <div className="submission-radio-group">
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
      ) : (
        <div className="thank-you-section">
          <h2>Thank You!</h2>
          <p>We got your fact. We will contact you soon!</p>
          <small>
            Remember, the importance of accuracy and truth cannot be overstated.
          </small>
        </div>
      )}
    </div>
  );
};

export default SubmitFactComponent;
