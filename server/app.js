const dotenv = require("dotenv");
dotenv.config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var messageRouter = require('./routes/message');

var app = express();


const cors = require("cors");


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/* Should not have these when production mode */
/* app.use(express.static(path.join(__dirname, 'public'))); */
/* 
app.use('/', indexRouter); */
app.use('/api/users', usersRouter);
app.use('/api/api', apiRouter);
app.use('/api/message', messageRouter);
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve("..", "front_end", "build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve("..", "front_end", "build", "index.html"))
    })
}   else if (process.env.NODE_ENV==="development") {
    const corsOptions = {
        origin: 'http://localhost:3000',
        credentials: true,
    }
    app.use(cors(corsOptions));
} 
/* db connection */
const mongoose = require('mongoose');
const mongoDB = "mongodb://localhost:27017/projectdb";
mongoose.Promise = Promise;
mongoose.connect(mongoDB);
const DB = mongoose.connection;
DB.on('error', console.error.bind(console, "mongodb Connection failed:"));
console.log("Environment:", process.env.NODE_ENV);
module.exports = app;
