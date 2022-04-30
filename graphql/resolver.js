const User = require("../models/users");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

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
    return {
      token: token,
      userId: existingEmail._id.toString(),
    };
  },
};
