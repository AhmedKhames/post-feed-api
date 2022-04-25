const { validationResult } = require("express-validator");
const User = require("../models/users");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

