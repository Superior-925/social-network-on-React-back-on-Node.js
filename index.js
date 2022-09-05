/*
  1. npm run keys:generate
  2. npm run start:dev
*/

const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
let app = express();

// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require('./src/config/database');

// Must first load the models
require('./src/models/user');
require('./src/models/refreshToken');
require('./src/models/post');
require('./src/models/avatar');
require('./src/models/friend');
require('./src/models/candidate');

// Pass the global passport object into the configuration function
require('./src/config/passport')(passport);

// This will initialize the passport object on every request
app.use(passport.initialize());

// put request body to req.body
app.use(bodyParser.json({limit: '50mb'}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));

//file access
app.use(express.static(__dirname + "/src/assets/avatars"));

// Allows our Angular application to make HTTP requests to Express application
app.use(cors());

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(require('./src/routes'));

app.use(function (req, res) {
  res.status(404).send({ message: 'Opppps.... wrong way!' });
});

app.use((err, req, res) => {
  res.status(500).send({ message: err.message });
});

/**
 * -------------- SERVER ----------------
 */

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
