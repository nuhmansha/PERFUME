

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config()
// const path = require('path');
const mongoose = require('mongoose');
const session=require("express-session")
const bodyParser = require("body-parser");

const userrouter = require('./router/userrouter');
const adminrouter=require('./router/adminrouter')
// Connect to MongoDB

app.use(session({
  secret:'nick',
  resave: false,
  saveUninitialized: false,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbUrl = 'mongodb://127.0.0.1:27017/perfume';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});


// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set("views", "views")

// Use the user router
app.use('/user', userrouter);
app.use('/admin',adminrouter)

// Serve static files from the 'public' directory
app.use(express.static( 'public'));


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


