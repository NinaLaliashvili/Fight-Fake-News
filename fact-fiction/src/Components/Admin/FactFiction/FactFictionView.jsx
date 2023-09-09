import "./FactFictionView.css";
import { useState, useEffect, useContext } from "react";
import Select from "react-select";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { LoginContext } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const { isUserAdmin } = useContext(LoginContext);
  const navigate = useNavigate();

  const categories = [
    "Random",
    "Science",
    "History",
    "Entertainment",
    "Politics",
    "Conspiracy",
    "Culture",
    "Religion",
  ];

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
    if (!isUserAdmin) {
      navigate("/");
    }
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
    window.scrollTo({ top: 500, left: 0, behavior: "smooth" });

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
          setSelectedCategory(factToEdit.category);
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
        category: selectedCategory,
      })
      .then((resp) => {
        clearInputs();
        setSelectedCategory("");
        notifyUserSuccess("Fact updated successfully!");
        loadFacts();
      })
      .catch((err) => {
        notifyUserError("Error updating the fact.");
      });
  };

  const handleSearch = () => {
    console.log(type.label);
    if (!type) {
      return;
    }
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
    setImg(null);
    setItemId(null);
  };

  const handleUserUploadImg = (e) => {
    e.preventDefault();
    const pic = e.target.files[0];
    setImg(pic);
    console.log("set image");
    console.log(img);
  };

  const sendImgToServerGetLink = () => {
    const formData = new FormData();

    formData.append("file", img);

    for (const value of formData.values()) {
      console.log(value);
    }
    //check that pic is appending- it is
    try {
      axios
        .post(
          `http://localhost:3082/img`,
          {
            formData,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((resp) => {
          if (!resp.url) {
            notifyUserError(
              "sorry, that didn't quite work! Try again,",
              resp.message
            );
          } else if (resp.url) {
            notifyUserSuccess(
              "your img saved in our server! we sent back a link, you'll see it in the image link box- now you can submit your full edit!"
            );

            setValues({
              ...values,
              imgLink: resp.url,
            });
            setTogglePic(!togglePic);
            //toggle back to the url view
          }

          // set value of imglink input to resp from cloudinary, then allow user to send
        })
        .catch((err) => {
          console.log(err);
          notifyUserError(err);
        });
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
            <p>Category: {fact.category}</p>
            <a href={fact.sourceLink} target="_blank" rel="noopener noreferrer">
              Source
            </a>
            <img
              src={fact.imgLink}
              alt={`image about this fact, ${fact.title}`}
            />
            <button onClick={() => handleEdit(fact._id)}>Edit</button>
          </div>
        ))}
        <button onClick={!isSearching ? handleSearch : clearSearch}>
          {!isSearching ? `Search` : `Clear Search`}
        </button>
      </div>

      <div className="approved-unapproved-title">
        <h2 className="white">Unapproved Facts</h2>
        <Icon
          i={toggle ? "toggle_on" : "toggle_off"}
          onClick={handleToggleClick}
          className="toggle-icon"
        />
        <h2 className="white">Approved Facts</h2>
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

                <select
                  id="categorySelect"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">-- Select a Category --</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

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
                    <form encType="multipart/form-data">
                      <input
                        type="file"
                        placeholder="upload image.."
                        onChange={handleUserUploadImg}
                        name="file"
                      />
                    </form>

                    <button onClick={sendImgToServerGetLink}> Set Image</button>
                  </div>
                )}
                <p>{togglePic ? `add file:` : "url:"}</p>
                <Icon
                  i={toggle ? "toggle_on" : "toggle_off"}
                  onClick={handleImgUrlToggle}
                  className="toggle-icon"
                />

                <button onClick={handleSave}>Save</button>
                {itemId && <button onClick={clearInputs}>Cancel</button>}
              </div>
            )}
            <div className="fact-items-container">
              {approvedFacts.map((fact) => (
                <div key={fact._id} className="fact-item">
                  <h2>{fact.title}</h2>
                  <p>{fact.description}</p>
                  <p>Category: {fact.category}</p>
                  <a
                    href={fact.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source
                  </a>
                  <img
                    src={fact.imgLink}
                    alt={`image about this fact, ${fact.title}`}
                  />
                  <button onClick={() => handleEdit(fact._id)}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="fact-items-container">
            {unapprovedFacts.map((fact) => (
              <div key={fact._id} className="fact-item">
                <h2>{fact.title}</h2>
                <p>{fact.description}</p>
                <p>Category: {fact.category}</p>
                <a
                  href={fact.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source
                </a>
                <img
                  src={fact.imgLink}
                  alt={`image about this fact, ${fact.title}`}
                />
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
