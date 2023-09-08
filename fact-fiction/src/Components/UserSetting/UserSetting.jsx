import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "./UserSetting.css";
import { Avatar, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";

import Pig from "../UserAvatar/avatars/pig.png";
import Rhino from "../UserAvatar/avatars/rhino.png";
import Bat from "../UserAvatar/avatars/bat.png";
import Elephant from "../UserAvatar/avatars/elephant.png";
import Elephant2 from "../UserAvatar/avatars/elephant2.png";
import Fox from "../UserAvatar/avatars/fox.png";
import Monkey from "../UserAvatar/avatars/monkey.png";
import Sun from "../UserAvatar/avatars/sun.png";
import Thumper from "../UserAvatar/avatars/thumper.png";
import Zebra from "../UserAvatar/avatars/zebra.png";
import { LoginContext } from "../../Context/AuthContext";

const profileImages = [
  { src: Pig },
  { src: Rhino },
  { src: Bat },
  { src: Elephant },
  { src: Elephant2 },
  { src: Fox },
  { src: Monkey },
  { src: Sun },
  { src: Thumper },
  { src: Zebra },
];

const UserSetting = () => {
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [originalUserData, setOriginalUserData] = useState({});
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const { avatar, setAvatar } = useContext(LoginContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const loadFacts = () => {
    axios
      .get(`http://localhost:3082/user/${userId}`)
      .then((resp) => {
        setOriginalUserData(resp.data);
        setLoggedInUser(resp.data);
        setSelectedAvatar(resp.data.avatar || "");
        console.log(resp.data);
      })
      .catch((err) => {
        notifyUserError("Error user update.");
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

  const notifyUserSuccess = (message) => {
    toast.success(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleSave = () => {
    axios
      .put(`http://localhost:3082/user/${userId}`, {
        avatar: selectedAvatar,
        email: loggedInUser.email,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        phone: loggedInUser.phone,
      })
      .then((resp) => {
        loadFacts();
        localStorage.setItem("firstName", loggedInUser.firstName);
        localStorage.setItem("lastName", loggedInUser.lastName);
        localStorage.setItem("avatar", selectedAvatar);
        notifyUserSuccess("User updated successfully!");
        setAvatar(selectedAvatar);
      })
      .catch((err) => {
        notifyUserError("Error user update.");
      });
  };

  const handleCancle = () => {
    setLoggedInUser(originalUserData);
    setSelectedAvatar(originalUserData.avatar || "");
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (image) => {
    setSelectedAvatar(image.src);
    setIsModalOpen(false);
  };

  const imageMap = profileImages.map((image, index) => (
    <img
      key={index}
      src={image.src}
      style={{ cursor: "pointer" }}
      onClick={() => handleImageChange(image)}
      alt={`Avatar`}
    />
  ));

  return (
    <div>
      <ToastContainer theme="light" />

      <h1>User Setting</h1>
      <div className="userInfo">
        <Avatar
          size={64}
          title="Choose Your Avatar"
          style={{ backgroundColor: "#cb81d0", cursor: "pointer" }}
          icon={<UserOutlined />}
          src={selectedAvatar || ""}
          onClick={showModal}
        />

        <Modal
          title="Choose Your Avatar"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {imageMap}
        </Modal>
        <input
          type="email"
          value={loggedInUser.email || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, email: e.target.value })
          }
          placeholder="email..."
        />
        <input
          type="text"
          value={loggedInUser.firstName || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, firstName: e.target.value })
          }
          placeholder="first name..."
        />
        <input
          type="text"
          value={loggedInUser.lastName || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, lastName: e.target.value })
          }
          placeholder="last name..."
        />
        <input
          type="tel"
          value={loggedInUser.phone || ""}
          onChange={(e) =>
            setLoggedInUser({ ...loggedInUser, phone: e.target.value })
          }
          placeholder="phone..."
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancle}>Cancel</button>
      </div>
    </div>
  );
};
export default UserSetting;
