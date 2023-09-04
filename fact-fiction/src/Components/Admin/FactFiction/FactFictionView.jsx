import "./FactFictionView.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer, toast } from "react-toastify";
import { Icon } from "../../Icon/Icon";

export const FactFictionView = () => {
  const [approvedFacts, setApprovedFacts] = useState([]);
  const [unapprovedFacts, setUnapprovedFacts] = useState([]);
  const [type, setType] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [values, setValues] = useState({
    title: "",
    description: "",
    sourceLink: "",
    imgLink: "",
  });
  const [itemId, setItemId] = useState(null);
  const [toggle, setToggle] = useState(true);
  const [togglePic, setTogglePic] = useState(true);
  const [img, setImg] = useState(null);

  const handleToggleClick = () => {
    setToggle(!toggle);
  };
  const handleImgUrlToggle = () => {
    setTogglePic(!togglePic);
  };

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
            imgLink: factToEdit.imgLink,
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
        imgLink: values.imgLink,
        //add url
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
    console.log(type.label);
    try {
      const filteredFacts = approvedFacts.filter(
        (fact) => fact.type === type.label
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
      imgLink: "",
    });
    setItemId(null);
  };

  const handleUserUploadImg = (e) => {
    e.preventDefault();
    const pic = e.target.files[0];
    setImg(pic);
    console.log("set image");
  };

  const sendImgToServerGetLink = () => {
    try {
      const imgForm = new FormData();

      imgForm.append("file", img);

      axios
        .post(
          `http://localhost:3082/img`,
          {
            imgForm,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((resp) => {
          notifyUserSuccess(
            "your img saved in our server! we sent back a link, you'll see it in the image link box- now you can submit your full edit!"
          );

          // set value of imglink input to resp from cloudinary, then send

          setValues({
            ...values,
            imgLink: resp.data,
          });
          setTogglePic(!togglePic);
          //toggle back to the url view
        })
        .catch((err) => {
          console.log(err);
          notifyUserError(err);
        });

      //send img to server, through cloudinary; return url
      //notify user that url has been sent back w toast
      //set toggler to img url
    } catch (err) {
      console.log(err);
      notifyUserError("whoops! something went wrong with the upload process");
    }
  };

  return (
    <div className="facts-approving-container">
      <ToastContainer theme="light" />

      <div className="column">
        <h1>Search By Fact or Fiction...</h1>
        <Select
          value={type}
          options={types}
          placeholder="Select fact or fiction..."
          onChange={(option) => setType(option || null)}
          isClearable={true}
        />
        {isSearching && <button onClick={clearSearch}>Clear Search...</button>}

        {searchResults.map((fact) => (
          <div key={fact._id} className="fact-item">
            <h2>{fact.title}</h2>
            <p>{fact.description}</p>
            <a href={fact.sourceLink} target="_blank" rel="noopener noreferrer">
              Source
            </a>
            <img src={fact.imgLink} />
            <button onClick={() => handleEdit(fact._id)}>Edit</button>
          </div>
        ))}
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="approved-unapproved-title">
        <h2>Unapproved Facts</h2>{" "}
        <Icon
          i={toggle ? "toggle_on" : "toggle_off"}
          onClick={handleToggleClick}
          className="toggle-icon"
        />
        <h2>Approved Facts</h2>
      </div>

      <div className="displaying-facts">
        {toggle ? (
          <div className="center">
            {approvedFacts.length > 0 && (
              <div className="approved-inputs">
                <input
                  type="text"
                  value={values.title}
                  onChange={(e) =>
                    setValues({ ...values, title: e.target.value })
                  }
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
                {togglePic ? (
                  <input
                    type="text"
                    value={values.imgLink}
                    onChange={(e) =>
                      setValues({ ...values, imgLink: e.target.value })
                    }
                    placeholder="image url..."
                  />
                ) : (
                  <div className="img-upload">
                    <input
                      type="file"
                      placeholder="upload image.."
                      onChange={handleUserUploadImg}
                    />
                    <button onClick={sendImgToServerGetLink}> Set Image</button>
                  </div>
                )}
                <p>{togglePic ? `edit img with file:` : "url:"}</p>
                <Icon
                  i={toggle ? "toggle_on" : "toggle_off"}
                  onClick={handleImgUrlToggle}
                  className="toggle-icon"
                />

                <button onClick={handleSave}>Save</button>
                {itemId && <h3 onClick={clearInputs}>Cancel</h3>}
              </div>
            )}

            {approvedFacts.map((fact) => (
              <div key={fact._id} className="fact-item">
                <h2>{fact.title}</h2>
                <p>{fact.description}</p>
                <a
                  href={fact.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
                </a>
                <img src={fact.imgLink} />
                <button onClick={() => handleEdit(fact._id)}>Edit</button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {unapprovedFacts.map((fact) => (
              <div key={fact._id} className="fact-item">
                <h2>{fact.title}</h2>
                <p>{fact.description}</p>
                <a
                  href={fact.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
                </a>
                <img src={fact.imgLink} />
                <button onClick={() => handleApproval(fact._id, true)}>
                  Approve
                </button>
                <button onClick={() => handleRejection(fact._id)}>
                  Reject
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
