const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../schemas/userSchema");
const User = new mongoose.model("User", userSchema);

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Verify the user's credentials
  User.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Error finding user" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the submitted password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: "Error logging in" });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // Create a JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Send the token to the client
      res.json({ token });
    });
  });
});

router.put("/subscribe/:id", (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send("Unauthorized");
      }
      // Retrieve the user from the token
      const currentUserId = decoded.id;
      // Find the current user by ID
      User.findById(currentUserId, (err, currentUser) => {
          if (err) {
              return res.status(500).send(err);
          }
          if (!currentUser) {
              return res.status(404).send("User not found");
          }
          // Find the user to be subscribed to by ID
          User.findById(id, (err, subscribedUser) => {
              if (err) {
                  return res.status(500).send(err);
              }
              if (!subscribedUser) {
                  return res.status(404).send("User not found");
              }
              // Check if user is already subscribed
              if (currentUser.subscribed_to.indexOf(id) !== -1) {
                  return res.status(400).send("Already subscribed");
              }
              // Add the subscribed user to the current user's subscribed_to array
              currentUser.subscribed_to.push(id);
              // Save the current user
              currentUser.save((err) => {
                  if (err) {
                      return res.status(500).send(err);
                  }
                  return res.status(200).send("Subscribed!");
              });
          });
      });
  });
});

router.put("/unsubscribe/:id", (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send("Unauthorized");
      }
      // Retrieve the user from the token
      const currentUserId = decoded.id;
      // Find the current user by ID
      User.findById(currentUserId, (err, currentUser) => {
          if (err) {
              return res.status(500).send(err);
          }
          if (!currentUser) {
              return res.status(404).send("User not found");
          }
          // Find the user to be subscribed to by ID
          User.findById(id, (err, subscribedUser) => {
              if (err) {
                  return res.status(500).send(err);
              }
              if (!subscribedUser) {
                  return res.status(404).send("User not found");
              }
              // Check if user is already subscribed
              if (currentUser.subscribed_to.indexOf(id) === -1) {
                  return res.status(400).send("Not subscribed");
              }
              // Add the subscribed user to the current user's subscribed_to array
              const index = currentUser.subscribed_to.indexOf(id);
              currentUser.subscribed_to.splice(index, 1);
              // Save the current user
              currentUser.save((err) => {
                  if (err) {
                      return res.status(500).send(err);
                  }
                  return res.status(200).send("Unsubscribed!");
              });
          });
      });
  });
});


router.get("/myaccount", (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send("Unauthorized");
      }
      // Retrieve the user from the token
      const currentUserId = decoded.id;
      User.findById(currentUserId, "-password", (err, user) => {
        if (err) {
          return res.status(500).send(err);
        }
        if (!user) {
          return res.status(404).send("User not found");
        }
        return res.status(200).send(user);
      });
      
  });
});

router.get("/all", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send("Unauthorized");
      }
      // Retrieve the user from the token
      const currentUserId = decoded.id;
      User.find({ _id: { $ne: currentUserId } }, { name: 1, _id: 1 }, (err, users) => {
          if (err) {
              return res.status(500).send(err);
          }
          return res.status(200).send(users);
      });
  });
});


module.exports = router;
