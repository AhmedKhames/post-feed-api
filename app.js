//libs
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const path = require("path");

const app = express();

const MONGO_URI = "mongodb://localhost:27017/messages";

// graphql
const {graphqlHTTP} = require('express-graphql');
const graphqlShema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');
const isAuth = require('./middlewares/isAuth'); 
const { clearImage } = require('./util/clearImage');

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
  if (req.method === 'OPTIONS') {
    return res.sendStatus (200);
  }
  next();
});


app.use(isAuth)

app.put('/post-image' ,(req,res,next)=>{

  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }

  if (!req.file) {
    return res.status(200).json({message : 'No file provided'});
  }
  if (req.body.oldPath) {
    //clear image
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({
    message : 'file uploaded',
    filePath : req.file.path
  })
});


app.use('/graphql',graphqlHTTP({
  schema: graphqlShema,
  rootValue: graphqlResolver,
  graphiql:true,
  customFormatErrorFn:(err)=>{
    if(!err.originalError){
      return err;
    }
    const data = err.originalError.data;
    const message = err.message || 'Error occured';
    const code = err.originalError.code || 500;
    return{
      message : message,
      statusCode : code,
      data:data
    }

  }
  
}))


app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  //const errorData = error.data ;
  res.status(status).json({
    message: message,
   // errorData:errorData
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

