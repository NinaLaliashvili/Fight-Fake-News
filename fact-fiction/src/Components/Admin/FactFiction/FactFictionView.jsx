import "./FactFictionView.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer, toast } from "react-toastify";

export const FactFictionView = () => {
  const [approvedFacts, setApprovedFacts] = useState([]);
  const [unapprovedFacts, setUnapprovedFacts] = useState([]);
  const [type, setType] = useState("");
  const [factsArray, setFactsArray] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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

  const types = [
    { value: "fact", label: "fact" },
    { value: "fiction", label: "fiction" },
  ];

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
      .put(`http://localhost:3082/approved-facts/${itemId}`, {
        title: values.title,
        description: values.description,
        sourceLink: values.sourceLink,
      })
      .then((resp) => {
        clearInputs();
        notifyUserSuccess("Fact updated successfully!");
        loadFacts();
      })
      .catch((err) => {
        notifyUserError("Error updating the fact.");
      });
  };

  const handleSearch = () => {
    console.log("hi");
    console.log(type.label);
    try {
      const filteredFacts = approvedFacts.filter(
        (fact) => fact.type == type.label
      );
      console.log(filteredFacts);
      if (filteredFacts) {
        setSearchResults(filteredFacts);
        console.log(searchResults);
        setIsSearching(true);
      } else {
        return;
      }
    } catch (err) {
      console.log("issue filtering");
      notifyUserError("issue filtering by this genre..");
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
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
          value={type}
          options={types}
          placeholder="Select fact or fiction..."
          // onChange={(option) => setType(option.value)} // Fix the onChange
          //react select just needs to use state to set value :)
          onChange={setType}
          isClearable={true}
        />

        <button onClick={handleSearch}>Search</button>

        {searchResults.map((fact) => (
          <div key={fact._id} className="fact-item">
            <h2>{fact.title}</h2>
            <p>{fact.description}</p>
            <a href={fact.sourceLink} target="_blank" rel="noopener noreferrer">
              Source
            </a>
            <button onClick={() => handleEdit(fact._id)}>Edit</button>
          </div>
        ))}
        {isSearching && <button onClick={clearSearch}>Clear Search...</button>}
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
        {approvedFacts.length > 0 && (
          <div>
            <input
              type="text"
              value={values.title}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
              placeholder="title.."
            />

            <input
              type="text"
              value={values.description}
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
              placeholder="description..."
            />

            <input
              type="text"
              value={values.sourceLink}
              onChange={(e) =>
                setValues({ ...values, sourceLink: e.target.value })
              }
              placeholder="source..."
            />
            <button onClick={handleSave}>Save</button>
            {itemId && <h3 onClick={clearInputs}>Cancel</h3>}
          </div>
        )}
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
