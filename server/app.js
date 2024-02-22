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
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
}
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/message', messageRouter);

/* db connection */
const mongoose = require('mongoose');
const mongoDB = "mongodb://localhost:27017/projectdb";
mongoose.Promise = Promise;
mongoose.connect(mongoDB);
const DB = mongoose.connection;
DB.on('error', console.error.bind(console, "mongodb Connection failed:"));

module.exports = app;
