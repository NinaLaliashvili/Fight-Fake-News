import "./FactFictionView.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer, toast } from "react-toastify";

export const FactFictionView = () => {
  const [approvedFacts, setApprovedFacts] = useState([]);
  const [unapprovedFacts, setUnapprovedFacts] = useState([]);
  const [genre, setGenre] = useState("");
  const [factsArray, setFactsArray] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [values, setValues] = useState({
    title: "",
    description: "",
    sourceLink: "",
  });
  const [itemId, setItemId] = useState(null);

  const loadFacts = () => {
    axios
      .get(`http://localhost:3082/unapproved-facts`)
      .then((resp) => {
        setUnapprovedFacts(resp.data);
      })
      .catch((err) => {
        notifyUserError("Error fetching unapproved facts.");
      });

    axios
      .get(`http://localhost:3082/approved-facts`)
      .then((resp) => {
        setApprovedFacts(resp.data);
      })
      .catch((err) => {
        notifyUserError("Error fetching approved facts.");
      });
  };

  useEffect(() => {
    loadFacts();
  }, []);

  const notifyUserError = (message) => {
    toast.error(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleApproval = (factId) => {
    axios
      .put(`http://localhost:3082/facts/${factId}`, { isApproved: true })
      .then((resp) => {
        notifyUserSuccess("Fact approved successfully!");
        loadFacts();
      })
      .catch((err) => {
        notifyUserError("Error approving the fact.");
      });
  };

  const handleRejection = (factId) => {
    axios
      .delete(`http://localhost:3082/facts/${factId}`)
      .then((resp) => {
        notifyUserSuccess("Fact rejected and removed successfully!");
        loadFacts();
      })
      .catch((err) => {
        notifyUserError("Error rejecting the fact.");
      });
  };

  const notifyUserSuccess = (message) => {
    toast.success(`${message}`, {
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

  const handleEdit = (factId) => {
    setItemId(factId);

    axios
      .get(`http://localhost:3082/approved-facts`)
      .then((res) => {
        const factToEdit = res.data.find((fact) => fact._id === factId);

        if (factToEdit) {
          setValues({
            ...values,
            title: factToEdit.title,
            description: factToEdit.description,
            sourceLink: factToEdit.sourceLink,
          });
        } else {
          console.error("Fact not found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching approved facts:", error);
      });
  };

  const handleSave = () => {
    axios
      .put(`http://localhost:3082/facts/${itemId}`, {
        title: values.title,
        description: values.description,
        sourceLink: values.sourceLink,
      })
      .then((resp) => {
        notifyUserSuccess("Fact updated successfully!");
        loadFacts();
      })
      .catch((err) => {
        notifyUserError("Error updating the fact.");
      });
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

  const clearInputs = () => {
    setValues({
      title: "",
      description: "",
      sourceLink: "",
    });
    setItemId(null);
  };

  return (
    <div>
      <ToastContainer theme="light" />
      <h1>Search By Fact or Fiction...</h1>
      <div className="column">
        <Select
          value={genre}
          options={genres}
          placeholder="Select Genre..."
          onChange={(option) => setGenre(option.value)} // Fix the onChange
          isClearable={true}
        />

        <button onClick={handleSearch}>Search</button>
        <ul>{renderAdminSearch(searchResults)}</ul>
      </div>
      <div>
        <h2>Unapproved Facts</h2>
        {unapprovedFacts.map((fact) => (
          <div key={fact._id} className="fact-item">
            <h2>{fact.title}</h2>
            <p>{fact.description}</p>
            <a href={fact.sourceLink} target="_blank" rel="noopener noreferrer">
              Source
            </a>
            <button onClick={() => handleApproval(fact._id, true)}>
              Approve
            </button>
            <button onClick={() => handleRejection(fact._id)}>Reject</button>
          </div>
        ))}
      </div>
      <div>
        <h2>Approved Facts</h2>
        <div>
          <input
            type="text"
            value={values.title}
            onChange={(e) => setValues({ ...values, title: e.target.value })}
          />

          <input
            type="text"
            value={values.description}
            onChange={(e) =>
              setValues({ ...values, description: e.target.value })
            }
          />

          <input
            type="text"
            value={values.sourceLink}
            onChange={(e) =>
              setValues({ ...values, sourceLink: e.target.value })
            }
          />
          <button onClick={handleSave}>Save</button>
          {itemId && <h3 onClick={clearInputs}>Cancel</h3>}
        </div>
        {approvedFacts.map((fact) => (
          <div key={fact._id} className="fact-item">
            <h2>{fact.title}</h2>
            <p>{fact.description}</p>
            <a href={fact.sourceLink} target="_blank" rel="noopener noreferrer">
              Source
            </a>
            <button onClick={() => handleEdit(fact._id)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};
