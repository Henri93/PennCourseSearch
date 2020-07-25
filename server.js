// server.js
import bodyParser from 'body-parser';
import logger from 'morgan';

// create our instances
const dotenv = require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app)


// set port to either a predetermined port number if you have set it up, or 3000
const API_PORT = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: "penncoursesearch" }));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'client/build')));

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/public', 'index.html'));
  });
}

server.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
