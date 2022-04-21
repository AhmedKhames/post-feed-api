const { validationResult } = require("express-validator");
const Post = require("../models/posts");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: 1,
        title: "first Post",
        content: "This is the first post",
        creator: {
          name: "Ahmed",
        },
        createdAt: new Date().toISOString(),
        imageUrl:
          "https://www.adazing.com/wp-content/uploads/2019/02/open-book-clipart-03.png",
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    return error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    creator: {
      name: "Khames",
    },
    createdAt: new Date().toISOString(),
    imageUrl:
      "https://www.adazing.com/wp-content/uploads/2019/02/open-book-clipart-03.png",
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
          err.statusCode = 500;
      }
      next(err);
    });
};
