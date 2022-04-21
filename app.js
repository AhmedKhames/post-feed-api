//libs
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//routes
const feedRoute = require("./routes/feed");

const app = express();

const MONGO_URI = "mongodb://localhost:27017/messages";

app.use(bodyParser.json()); //application json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoute);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;

  res.status(status).json({
    message: message,
  });
});

mongoose
  .connect(MONGO_URI)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
