//libs
const express = require('express');
const bodyParser = require('body-parser');
//routes
const feedRoute = require('./routes/feed');


const app = express();

app.use(bodyParser.json());//application json

app.use((req,res,next)=>{
    res.setHeader('Access-Controle-Allow-Origin','*');
    res.setHeader('Access-Controle-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Controle-Allow-Headers','Content-Type, Authorization');
    next();
})

app.use('/feed',feedRoute);


app.listen(8080);