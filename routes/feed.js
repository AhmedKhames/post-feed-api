const express = require("express");
const feedController = require("../controllers/feed");
const { check, body } = require("express-validator");

const router = express.Router();

//GET /feed/posts
router.get(
  "/posts",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.getPosts
);

//POST /feed/post
router.post("/post", feedController.createPost);

module.exports = router;
