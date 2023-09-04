require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.MY_CLOUD_NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

module.exports = cloudinary;
