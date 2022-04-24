const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User = require("../models/users");

const router = express.Router();

//POST /auth/signup
router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email is already exists");
          }
        });
      })
      .normalizeEmail(),
    body("name").trim().not().isEmpty(),
    body("password").trim().isLength({ min: 6 }).isAlphanumeric(),
  ],
  authController.signup
);

router.post('/login',authController.login);

module.exports = router;
