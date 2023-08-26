import "./FactFictionView.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";

export const FactFictionView = () => {
  const [genre, setGenre] = useState("");
  const [factsArray, setFactsArray] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const loadFacts = () => {
    try {
      //this URL will depend on collection
      axios
        .get(`http://localhost:3071/facts`)
        .then((resp) => {
          console.log(resp);
          setFactsArray(resp.data);
        })
        .catch((err) => {
          console.log(err);
          notifyUserError(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadFacts();
  }, []);

  const notifyUserError = (message) => {
    toast.error(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const genres = [
    { value: "News", label: "News" },
    { value: "History", label: "History" },
    { value: "Science", label: "Science" },
    { value: "Random", label: "Random" },
  ];

  const renderAdminSearch = (list) => {
    if (list) {
      return list.map((i) => {
        return (
          <li key={i._id}>{i.fact}</li>
          //this will depend on how we name the resource/make a component card to render facts
        );
      });
    }
  };
  const handleSearch = () => {
    console.log("hi");
    try {
      const filteredFacts = factsArray.filter((fact) => fact.genre == genre);
      if (filteredFacts) {
        setSearchResults(filteredFacts);
      } else {
        return;
      }
    } catch (err) {
      console.log("issue filtering");
      notifyUserError("issue filtering by this genre..");
    }
  };
  return (
    <div>
      <ToastContainer theme="light" />
      <h1>Search By Fact or Fiction...</h1>
      <div className="column">
        <Select
          defaultValue={genre}
          options={genres}
          placeholder="Select Genre..."
          onChange={setGenre}
          isClearable={true}
        />

        <button onClick={handleSearch}>Search</button>
        <ul>{renderAdminSearch(searchResults)}</ul>
      </div>
    </div>
  );
};
