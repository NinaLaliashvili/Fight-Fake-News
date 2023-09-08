import { useContext, useState } from "react";
import { Avatar, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./UserAvatar.css";
import { LoginContext } from "../../Context/AuthContext";


const UserAvatar = ({ avatarSelected, profileImages, defaultAvatar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { avatar, setAvatar } = useContext(LoginContext);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (imageSrc) => {
    setAvatar(imageSrc.src)
    avatarSelected(imageSrc.src);
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
      <Avatar
        size={64}
        title="Choose Your Avatar"
        style={{ backgroundColor: "#cb81d0", cursor: "pointer" }}
        icon={<UserOutlined />}
        src={avatar}
        onClick={showModal}
      />

      <Modal
        title="Choose Your Avatar"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="modal-content">{imageMap}</div>
      </Modal>
    </div>
  );
};

export default UserAvatar;
