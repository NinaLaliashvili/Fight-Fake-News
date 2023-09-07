import { useState } from "react";
import { Avatar, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";

const UserAvatar = ({ avatarSelected, profileImages, defaultAvatar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userImage, setUserImage] = useState(defaultAvatar);

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
    setUserImage(imageSrc.src);
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
        src={userImage}
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
    </div>
  );
};

export default UserAvatar;
