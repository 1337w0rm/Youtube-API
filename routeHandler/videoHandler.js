const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const videoSchema = require("../schemas/videoSchema");
const router = express.Router();
const Video = new mongoose.model("Video", videoSchema);

router.post("/add", (req, res) => {
  const { video_url, description, author } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    // Retrieve the user from the token
    const user = decoded.id;
    // create the video and associate it to the user
    const video = new Video({ video_url, description, author, user });
    video.save((err) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).send(video);
    });
  });
});

router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const { video_url, description, author } = req.body;

  // Get the user's information from the JWT token
  const token = req.headers.authorization.split(" ")[1];
  const currentUser = jwt.verify(token, process.env.JWT_SECRET);
  // Find the video in the database by id
  Video.findById(id, (err, video) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!video) {
      return res.status(404).send("Video not found");
    }

    // Check that the user making the request is the same user who added the video
    if (currentUser.id !== video.user.toString()) {
      return res.status(401).send("Unauthorized to update this video");
    }

    // Update the video's properties
    video.video_url = video_url;
    video.description = description;
    video.author = author;

    // Save the updated video to the database
    video.save((err) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).send(video);
    });
  });
});

router.get("/all/:id", (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }

    // Find all videos of the user in the database
    Video.find({ user: id }, (err, videos) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).send(videos);
    });
  });
});

router.put("/like/:id", (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    // Retrieve the user from the token
    const user = decoded;
    // Find the video by ID
    Video.findById(id, (err, video) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (video.likedBy.includes(user.id)) {
        return res.status(400).send("You already liked this video");
      }
      // increment the like_count by 1
      video.like_count += 1;
      video.likedBy.push(user.id);
      video.save((err) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.status(200).send(video);
      });
    });
  });
});

router.put("/dislike/:id", (req, res) => {
  const id = req.params.id;
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    // Retrieve the user from the token
    const user = decoded;
    // Find the video by ID
    Video.findById(id, (err, video) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (!video.likedBy.includes(user.id)) {
        return res.status(400).send("You already disliked this video");
      }

      // increment the like_count by 1
      video.like_count -= 1;
      const index = video.likedBy.indexOf(user.id);
      video.likedBy.splice(index, 1);
      video.save((err) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.status(200).send(video);
      });
    });
  });
});

router.put("/comment/:id", (req, res) => {
  const id = req.params.id;
  const { comment, author } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized");
    }
    // Retrieve the user from the token
    const user = decoded;
    // Find the video by ID
    Video.findById(id, (err, video) => {
      if (err) {
        return res.status(500).send(err);
      }

      video.comments.push({ comment, author });
      video.save((err) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.status(200).send(video);
      });
    });
  });
});

module.exports = router;
