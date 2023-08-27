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

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
    usersCollection = client.db("factsorfictions").collection("users");
    factsCollection = client.db("factsorfictions").collection("facts");
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

const port = 3082;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
