const { validationResult } = require("express-validator");

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
    return res.status(422).json({
      message: "validation error",
      errors: errors.array(),
    });
  }

  const title = req.body.title;
  const content = req.body.content;

  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: Date.now().toString(),
      title: title,
      content: content,
      creator: {
        name: "Khames",
      },
      createdAt: new Date().toISOString(),
      imageUrl:
        "https://www.adazing.com/wp-content/uploads/2019/02/open-book-clipart-03.png",
    },
  });
};
