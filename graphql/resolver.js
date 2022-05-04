const User = require("../models/users");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Post = require("../models/posts");
const { clearImage } = require("../util/clearImage");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const existingEmail = await User.findOne({ email: userInput.email });

    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Email is invalid" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 6 })
    ) {
      errors.push({
        message: "Password is too Short use more than 6 character",
      });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    if (existingEmail) {
      throw new Error("Email is existing");
    }

    const hashedPass = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      password: hashedPass,
      name: userInput.name,
    });

    const storedUser = await user.save();

    return storedUser;
    //return { ...storedUser._doc, _id: storedUser._id.toString() };
  },

  login: async function ({ email, password }, req) {
    const existingEmail = await User.findOne({ email: email });
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "Email is invalid" });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 6 })
    ) {
      errors.push({
        message: "Password is too Short use more than 6 character",
      });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    if (!existingEmail) {
      throw new Error("Email dose not exist");
    }
    const compPass = await bcrypt.compare(password, existingEmail.password);
    if (!compPass) {
      throw new Error("Wrong Password");
    }
    const token = jwt.sign(
      {
        userId: existingEmail._id.toString(),
        email: existingEmail.email,
      },
      "secretsecret",
      { expiresIn: "1h" }
    );
    console.log(token);
    return {
      token: token,
      userId: existingEmail._id.toString(),
    };
  },

  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid user.");
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  posts: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");

    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalPosts,
    };
  },

  post: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const currPost = await Post.findById(id).populate("creator");

    if (!currPost) {
      const error = new Error("Not Found");
      error.code = 404;
      throw error;
    }

    return {
      ...currPost._doc,
      _id: currPost._id.toString(),
      createdAt: currPost.createdAt.toISOString(),
      updatedAt: currPost.updatedAt.toISOString(),
    };
  },

  editPost: async function ({ id, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const currPost = await Post.findById(id).populate("creator");

    if (!currPost) {
      const error = new Error("Not Found");
      error.code = 404;
      throw error;
    }

    if (currPost.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.code = 403;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    currPost.title = postInput.title;
    currPost.content = postInput.content;

    if (postInput.imageUrl !== "undefined") {
      currPost.imageUrl = postInput.imageUrl;
    }
    const updatedPost = await currPost.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },

  deletePost: async function ({ id }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }

    const currPost = await Post.findById(id);

    if (!currPost) {
      const error = new Error("Not Found");
      error.code = 404;
      throw error;
    }

    if (currPost.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.code = 403;
      throw error;
    }
    clearImage(currPost.imageUrl);
    await Post.findByIdAndRemove(id);

    const currUser = await User.findById(req.userId);
    currUser.posts.pull(id);
    await currUser.save();
    return true;
  },

  user: async function (_, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const currUser = await User.findById(req.userId);

    if (!currUser) {
      const error = new Error("Not Found");
      error.code = 404;
      throw error;
    }

    return {
      ...currUser._doc,
      _id: currUser._id.toString(),
    };
  },

  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const currUser = await User.findById(req.userId);

    if (!currUser) {
      const error = new Error("Not Found");
      error.code = 404;
      throw error;
    }

    if (currUser._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.code = 403;
      throw error;
    }
    if (validator.isEmpty(status)) {
      const error = new Error("Title is status.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    currUser.status = status;
    await currUser.save();
    return {
      ...currUser._doc,
      _id: currUser._id.toString(),
    };
  },
};
