//libs
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const path = require("path");

//routes
const feedRoute = require("./routes/feed");

const app = express();

const MONGO_URI = "mongodb://localhost:27017/messages";


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(path.join(__dirname, "images"), (err) => {
      cb(null, "images");
    });
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb)=> {
  if (file.mimetype === 'image/png'||file.mimetype === 'image/jpg'||file.mimetype === 'image/jpeg') {
    cb(null,true);
  }else{
    cb(null,false);
  }
}


app.use(bodyParser.json()); //application json

app.use(multer({ storage: fileStorage ,fileFilter:fileFilter}).single("image"));

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
