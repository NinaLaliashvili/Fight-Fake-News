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

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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

let rooms = {};
let matchmakingQueue = [];

function findOpponentInRoom(roomId, currentSocketId) {
  const playersInRoom = rooms[roomId];

  if (!playersInRoom) return null;

  const socketIds = Object.keys(playersInRoom);

  if (socketIds.length < 2) return null; // Not enough players for a match

  // Find the first opponent that is not the current player
  const opponentSocketId = socketIds.find((id) => id !== currentSocketId);

  if (!opponentSocketId) return null;

  return {
    id: opponentSocketId,
  };
}

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);

    socket.emit("status", "Looking for a match...");

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);

      // Remove player from rooms object
      if (rooms[roomId] && rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];
      }

      // Broadcast to other user in the room that this user has disconnected
      socket.to(roomId).emit("opponentDisconnected");
    });

    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = 0; // initialize player score
    const gameSession = await gameSessionsCollection.findOne({ roomId });
    if (gameSession) {
      socket.join(roomId);
      rooms[roomId] = gameSession; // Load game session from MongoDB
    } else {
      // erroorrrrrrorro
    }
    const opponent = findOpponentInRoom(roomId, socket.id);
    if (opponent) {
      // Notify both players that a match has been found
      socket.emit("matchFound", { opponentName: opponent.name });
      io.to(opponent.id).emit("matchFound", { opponentName: socket.name });
    }
  });

  socket.on("sendScore", async (data) => {
    rooms[data.roomId][socket.id] = data.score; // update player score
    io.to(data.roomId).emit("updateScores", rooms[data.roomId]); // broadcast new scores
    const { roomId, playerId, score } = data;
    if (rooms[roomId]) {
      // Update score in MongoDB
      await multiplayerScoresCollection.insertOne({
        gameId: roomId,
        playerId,
        score,
        createdAt: new Date(),
      });

      // Update game session in MongoDB
      const fieldToUpdate =
        playerId === rooms[roomId].player1 ? "player1Score" : "player2Score";
      await gameSessionsCollection.updateOne(
        { roomId },
        { $set: { [fieldToUpdate]: score } }
      );

      io.to(roomId).emit("updateScores", rooms[roomId]); // Broadcast new scores
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Enter Matchmaking Event
  socket.on("enterMatch", async (userId) => {
    if (!userId) {
      return socket.emit("error", "UserId is required");
    }

    if (matchmakingQueue.some((e) => e.userId === userId)) {
      return socket.emit("error", "You're already in the queue.");
    }

    matchmakingQueue.push({ userId, socketId: socket.id });

    if (matchmakingQueue.length >= 2) {
      let player1 = matchmakingQueue[0];
      let player2 = matchmakingQueue[1];

      if (player1.userId === player2.userId) {
        return socket.emit("waiting", "Waiting for a match...");
      }

      matchmakingQueue = matchmakingQueue.slice(2);

      const uniqueRoomId = new ObjectId().toHexString();
      const questions = [];

      await gameSessionsCollection.insertOne({
        roomId: uniqueRoomId,
        player1: player1.userId,
        player2: player2.userId,
        questions,
        currentQuestion: 0,
        player1Score: 0,
        player2Score: 0,
        status: "active",
        createdAt: new Date(),
        endedAt: null,
      });

      let player1Name = await usersCollection.findOne({
        _id: new ObjectId(player1.userId),
      });
      let player2Name = await usersCollection.findOne({
        _id: new ObjectId(player2.userId),
      });

      io.to(player1.socketId).emit("matchFound", {
        message: "Match found!",
        roomId: uniqueRoomId,
        opponentName: player2Name.name,
        opponentId: player2.userId,
      });

      io.to(player2.socketId).emit("matchFound", {
        message: "Match found!",
        roomId: uniqueRoomId,
        opponentName: player1Name.name,
        opponentId: player1.userId,
      });
    } else {
      socket.emit("waiting", "Waiting for a match...");
    }
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
    } = req.body;

    // Validate that the required fields are present. Adjust validation as needed.
    if (!title || !description || !fullName || !email) {
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
      isApproved: false,
    };

    const result = await factsCollection.insertOne(newFact);

    res.status(201).json({ factId: result.insertedId });
  } catch (error) {
    console.error("Error submitting fact:", error);
    res.status(500).send("Something went wrong. Please try again later.");
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
    const approvedFacts = await factsCollection
      .find({ isApproved: true })
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
    const { title, description, sourceLink } = req.body;

    // Validate that the required fields are present. Adjust validation as needed.
    if (!title || !description || !sourceLink) {
      return res
        .status(400)
        .send("Please provide title, description, and sourceLink.");
    }

    await factsCollection.updateOne(
      { _id: new ObjectId(factId), isApproved: true }, // Only update approved facts
      { $set: { title, description, sourceLink } }
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

// app.post("/enterMatch", async (req, res) => {
//   const { userId } = req.body;

//   if (!userId) {
//     return res.status(400).json({ message: "UserId is required" });
//   }

//   // Check if the user is already in the queue
//   if (matchmakingQueue.includes(userId)) {
//     return res.status(400).json({ message: "You're already in the queue." });
//   }

//   // Add the user to the queue
//   matchmakingQueue.push(userId);

//   if (matchmakingQueue.length >= 2) {
//     // Dequeue two users to start a new game
//     let player1 = matchmakingQueue[0];
//     let player2 = matchmakingQueue[1];

//     if (player1 === player2) {
//       // Same person; not a valid match
//       return res.json({ message: "Waiting for a match..." });
//     }

//     // Remove players from queue
//     matchmakingQueue = matchmakingQueue.slice(2);

//     // Generate a unique room ID like you do in /startGame
//     const uniqueRoomId = new ObjectId().toHexString();

//     // Initialize game session etc., similar to what you do in /startGame
//     const questions = []; // Populate this as needed
//     await gameSessionsCollection.insertOne({
//       roomId: uniqueRoomId,
//       player1,
//       player2,
//       questions,
//       currentQuestion: 0,
//       player1Score: 0,
//       player2Score: 0,
//       status: "active",
//       createdAt: new Date(),
//       endedAt: null,
//     });

//     // Fetch names of the players (if you store them in your DB)
//     let player1Name = await usersCollection.findOne({
//       _id: new ObjectId(player1),
//     });
//     let player2Name = await usersCollection.findOne({
//       _id: new ObjectId(player2),
//     });

//     console.log("Player 1:", player1Name);
//     console.log("Player 2:", player2Name);

//     // Notify the clients
//     return res.json({
//       message: `Match found!`,
//       roomId: uniqueRoomId,
//       opponentName: player1 === userId ? player2Name.name : player1Name.name,
//       opponentId: player1 === userId ? player2 : player1,
//     });
//   } else {
//     // No match found yet, leave the user in the queue
//     return res.json({ message: "Waiting for a match..." });
//   }
// });

const port = 3082;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
