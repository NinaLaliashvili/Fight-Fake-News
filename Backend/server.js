const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");
const http = require("http");
const socketIo = require("socket.io");

//img upload requirements below
const multer = require("multer");
const cloudinary = require("./cloudinary/cloudinary");
const fs = require("fs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const dirname = path.resolve();
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "*",
  })
);

//configure multer
//pretty sure error is here w upload pic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now());
  },
});
const upload = multer({ storage });

//function to upload to cloudinary and receive link; call this in route for upload
async function uploadImgToCloudinary(localFilePath) {
  console.log("in cloudinary function");
  const mainFolder = "main";
  console.log("in main folder");
  const filePathOnCloud = mainFolder + "/" + localFilePath;
  console.log("in specific path on cloudinary");

  return cloudinary.uploader
    .upload(localFilePath, { public_id: filePathOnCloud })
    .then((result) => {
      "made it to cloudinary uploader";
      fs.unlinkSync(localFilePath);

      return {
        message: "success",
        url: result.url,
      };
    })
    .catch((error) => {
      console.log(error);
      fs.unlinkSync(localFilePath);
      return { message: "whoops" };
    });
}

//server for game

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let waitingPlayer = null;

//connection with mongo db
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
//my collection
let usersCollection;
let factsCollection;
let gameSessionsCollection;
let multiplayerScoresCollection;

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
    usersCollection = client.db("factsorfictions").collection("users");
    factsCollection = client.db("factsorfictions").collection("facts");
    gameSessionsCollection = client
      .db("factsorfictions")
      .collection("GameSessions");
    multiplayerScoresCollection = client
      .db("factsorfictions")
      .collection("MultiplayerScores");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
run().catch(console.dir);
// app use implementation
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
// middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token:", token);
  if (token == null) {
    console.log("Token is null");
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Error during token verification:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log(req.user);
    next();
  });
}

//===============================Socket Io===============================================

io.on("connection", (socket) => {
  const token = socket.handshake.query.token;
  if (!token) {
    console.log("No token provided.");
    return socket.disconnect(true);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("Invalid token:", err);
      return socket.disconnect(true);
    }

    console.log("Decoded object:", decoded);
    const userId = decoded.id;
    if (!userId) {
      console.log("No userId in decoded object");
      return socket.disconnect(true);
    }

    socket.on("enterMatch", () => {
      if (waitingPlayer) {
        socket.join(waitingPlayer.room);
        socket.to(waitingPlayer.room).emit("matched", { opponentName: userId });
        socket.emit("matched", { opponentName: waitingPlayer.userId });
        waitingPlayer = null;
      } else {
        const room = `room-${userId}`;
        socket.join(room);
        waitingPlayer = { userId, room, socketId: socket.id };
        socket.emit("waiting", {
          message: "Waiting for other user to join the room",
        });
      }
    });

    socket.on("disconnect", () => {
      if (waitingPlayer && waitingPlayer.socketId === socket.id) {
        waitingPlayer = null;
      }
    });

    socket.on("answer", async (data) => {
      // Assuming that data contains { isCorrect, roomId }
      const roomId = data.roomId;
      const isCorrect = data.isCorrect;

      // Fetch current game session based on roomId
      const currentSession = await gameSessionsCollection.findOne({ roomId });

      if (!currentSession) {
        return socket.emit("error", { message: "Game session not found" });
      }

      // Update the player's score
      const fieldToUpdate =
        userId === currentSession.player1 ? "player1Score" : "player2Score";
      const newScore = isCorrect
        ? currentSession[fieldToUpdate] + 1
        : currentSession[fieldToUpdate];

      await gameSessionsCollection.updateOne(
        { roomId },
        { $set: { [fieldToUpdate]: newScore, updatedAt: new Date() } }
      );

      // Update multiplayerScoresCollection
      await multiplayerScoresCollection.updateOne(
        { gameId: roomId, playerId: userId },
        { $set: { score: newScore, updatedAt: new Date() } }
      );

      socket.to(roomId).emit("scoreUpdate", { opponentScore: newScore });
      socket.emit("scoreUpdate", { yourScore: newScore });
    });

    socket.on("endGame", async () => {
      const roomId = `room-${userId}`;

      // Update the game session status to 'ended'
      await gameSessionsCollection.updateOne(
        { roomId },
        {
          $set: { status: "ended", endedAt: new Date(), updatedAt: new Date() },
        }
      );

      const currentSession = await gameSessionsCollection.findOne({ roomId });

      let winner;
      if (currentSession.player1Score > currentSession.player2Score) {
        winner = currentSession.player1;
      } else if (currentSession.player1Score < currentSession.player2Score) {
        winner = currentSession.player2;
      } else {
        winner = "It's a tie!";
      }

      socket.to(roomId).emit("endGame", { winner });
      socket.emit("endGame", { winner });
    });
  });
});
// -------------------------- Start Server Side----------------------------

//General api route
app.get("/", (req, res) => {
  res.send("This is the best project server");
});

//Get users api
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error("Failed to get users", error);
    res.sendStatus(500);
  }
});

//Get user by id api
app.get("/user/:id", async (req, res) => {
  if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.error("Failed to get user", error);
    res.sendStatus(500);
  }
});

app.put("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { email, firstName, lastName, phone } = req.body;

    if (!email || !firstName || !lastName || !phone) {
      return res
        .status(400)
        .send("Please provide email, firstName, lastName and phone.");
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) }, // Only update approved facts
      { $set: { email, firstName, lastName, phone } }
    );

    res.json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Sign up users api
app.post("/signup", async (req, res) => {
  console.log("Received signup data:", req.body);
  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    phone,
    bio = "Hello there <3",
  } = req.body;

  //check if any of the fields are empty, if they are, there is an err
  if (
    !email ||
    !password ||
    !confirmPassword ||
    !firstName ||
    !lastName ||
    !phone
  ) {
    return res.status(400).send("Please fill in all the required fields.");
  }

  //check if email is valid with "@"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Please enter a valid email address.");
  }

  //check if password is between 6 and 30 characters, and includes one digit and one uppercase letter
  const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{6,30}$/;
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send(
        "Password must be between 6-30 characters, include at least one digit and one uppercase letter."
      );
  }

  //check if password and confirmPassword match
  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  //check if phone number contains only digits
  const phoneRegex = /^\d+$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).send("Phone number should only contain digits.");
  }
  //checking if email or phone already exists
  try {
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).send("Email or phone number already exists.");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      bio,
    };

    const result = await usersCollection.insertOne(user);

    res.status(201).json({ userId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Log in api
app.post("/login", async (req, res) => {
  console.log("Received signup data:", req.body);
  const { email, password } = req.body;

  //check if these fields are full
  if (!email || !password) {
    return res.status(400).send("Please fill in all the required fields.");
  }
  //find user in db
  try {
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).send("User does not exist.");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).send("Incorrect password.");
    }

    //just to make sure it works, after pushing front end guys, I will fix all issues regarding server routes.
    console.log("User isAdmin:", user.isAdmin);

    const token = jwt.sign(
      { id: user._id.toString(), isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "48h",
      }
    );
    //server responds with the updated user data, but first it removes the password field to ensure that sensitive data is not exposed
    const { password: _, ...userWithoutPassword } = user;

    res.json({ userId: user._id.toString(), user: userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// add submited fact to db api, (post req)
app.post("/submit-fact", async (req, res) => {
  try {
    const {
      title,
      description,
      sourceLink,
      fullName,
      email,
      mobileNumber,
      type,
      category
    } = req.body;

    // Validate that the required fields are present. Adjust validation as needed.
    if (!title || !description || !fullName || !email || !category) {
      return res.status(400).send("Please fill in all the required fields.");
    }

    const newFact = {
      title,
      description,
      sourceLink,
      fullName,
      email,
      mobileNumber,
      type,
      category,
      isApproved: false,
    };

    const result = await factsCollection.insertOne(newFact);

    res.status(201).json({ factId: result.insertedId });
  } catch (error) {
    console.error("Error submitting fact:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});
//add photo upload to fact; receive link from cloudinary on client, add that link to the edit fact form. users cant add images to protect us from unwanted images. just for admins.

app.post("/img", upload.single("file"), async (req, res) => {
  try {
    console.log("called upload");

    const result = await uploadImgToCloudinary(req.file.path);
    console.log("got to result");
    console.log(result);
    if (result) {
      res.status(201).send(JSON.stringify({ url: result.url }));
    } else {
      res.status(500).send("sorry... try uploading again?");
    }
  } catch (err) {
    console.error("something went wrong uploading image to cloud server:", err);
    res
      .status(500)
      .send("something went wrong with the cloud storage. Please try again.");
  }
});

// get unapproved facts
app.get("/unapproved-facts", async (req, res) => {
  try {
    const unapprovedFacts = await factsCollection
      .find({ isApproved: false })
      .toArray();
    res.json(unapprovedFacts);
  } catch (error) {
    console.error("Error fetching unapproved facts:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// get only approved facts
app.get("/approved-facts", async (req, res) => {
  try {
    const category = req.query.category;
    let query = { isApproved: true };
   if (category) {
      query.category = category; 
    }

    const approvedFacts = await factsCollection
      .find(query)
      .toArray();
    res.json(approvedFacts);
  } catch (error) {
    console.error("Error fetching approved facts:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

app.put("/approved-facts/:factId", async (req, res) => {
  try {
    const factId = req.params.factId;
    const { title, description, sourceLink, imgLink, category } = req.body;

    // Validate that the required fields are present. Adjust validation as needed.
    if (!title || !description || !sourceLink) {
      return res
        .status(400)
        .send("Please provide title, description, and sourceLink.");
    }

    await factsCollection.updateOne(
      { _id: new ObjectId(factId), isApproved: true }, // Only update approved facts
      { $set: { title, description, sourceLink, imgLink, category } }
    );

    res.json({ message: "Approved fact updated successfully." });
  } catch (error) {
    console.error("Error updating approved fact:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// update approval status api
app.put("/facts/:factId", async (req, res) => {
  try {
    const factId = req.params.factId;
    const { isApproved } = req.body;

    await factsCollection.updateOne(
      { _id: new ObjectId(factId) },
      { $set: { isApproved: isApproved } }
    );

    res.json({ message: "Fact approval status updated." });
  } catch (error) {
    console.error("Error updating fact approval status:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// delete a fact by its ID
app.delete("/facts/:factId", async (req, res) => {
  try {
    const factId = req.params.factId;

    await factsCollection.deleteOne({ _id: new ObjectId(factId) });

    res.json({ message: "Fact successfully deleted." });
  } catch (error) {
    console.error("Error deleting fact:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// post api to save user's score
app.post("/save-score", authenticateToken, async (req, res) => {
  try {
    const { userId, score } = req.body;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { score } }
    );
    console.log("UserId:", userId);
    console.log("Score:", score);
    console.log("Update Result:", result);

    if (result.matchedCount > 0) {
      res.status(200).send("Score updated successfully");
    } else {
      throw new Error("Failed to find user");
    }
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// get 5 users with the highest scores:
app.get("/top-scores", async (req, res) => {
  try {
    const topUsers = await usersCollection
      .find({})
      .sort({ score: -1 }) // Sorting in descending order
      .limit(5) // Getting only first 5 users
      .toArray(); // Converting to an array

    res.json(topUsers);
  } catch (error) {
    console.error("Error fetching top 5 scores:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//delete user from leaderboard api
app.delete("/remove-user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    res.json({ message: "User successfully deleted." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//add user to leaderboard api
app.post("/add-user", async (req, res) => {
  const { firstName, lastName, score } = req.body;
  try {
    const result = await usersCollection.insertOne({
      firstName,
      lastName,
      score,
    });
    res.json({ message: "User added successfully.", id: result.insertedId });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// game=====================================================
// Create a new game session
app.post("/startGame", async (req, res) => {
  const { player1, player2, questions } = req.body;
  const uniqueRoomId = new ObjectId().toHexString();
  try {
    const result = await gameSessionsCollection.insertOne({
      roomId: uniqueRoomId,
      player1,
      player2,
      questions,
      currentQuestion: 0,
      player1Score: 0,
      player2Score: 0,
      status: "active",
      createdAt: new Date(),
      endedAt: null,
    });
    res.json({
      message: "Game session created successfully.",
      id: result.insertedId,
      roomId: uniqueRoomId,
    });
  } catch (error) {
    console.error("Error creating game session:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// Add multiplayer score
app.post("/updateScore", async (req, res) => {
  const { gameId, playerId, score } = req.body;
  try {
    const result = await multiplayerScoresCollection.updateOne(
      { gameId, playerId },
      { $set: { score, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ message: "Score updated successfully.", id: result.insertedId });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

const port = 3082;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
