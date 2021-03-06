// All imports needed here
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const fileUpload = require('express-fileupload')
const db = require('./models/db');

const markdown = require('markdown').markdown;


// get environment variables
require('dotenv').config()
const dbUri = process.env.SERVER_DB_URI
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}

db.connect();

const secret = process.env.SECRET
const port = process.env.PORT || 3000;

mongoose.connect(dbUri, options, (err) => {
  console.log(err? err : 'Established connection with MongoDB!');
});

// storage for user session
const store = new mongoStore({
  uri: dbUri,
  databaseName: 'flavors101',
  collection: 'sessions',
})
store.on('error', err => console.log(err.message))

const app = express();

app.use(fileUpload())
app.use(express.urlencoded({ extended: true}))
app.use(express.json())
// Creates an engine called "hbs" using the express-handlebars package.
app.engine('hbs', exphbs.create({
  extname: 'hbs',
  defaultView: 'main',
  helpers: {
    isEqual: (arg1, arg2) => arg1.toString() === arg2.toString(),
    parseMarkdown: (text) =>{
      text = markdown.toHTML(text);

      if (text.startsWith('<p>')) {
        text = text.slice(3, text.length - 4); 
      }
      return text;
    }
  }
}).engine);

app.use(session({
  key: 'sid',
  secret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 18144e5 // three weeks
  },
  store,
}));

// Setting the view engine to the express-handlebars engine we created
app.set('view engine', 'hbs');

// serve static files
app.use('/public', express.static('public'));

// Flash
app.use(flash());

// Global error/sucess vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.session = req.session
  next();
});

// Routes imports
const authRouter = require('./routes/user');
const recipeRouter = require('./routes/post');

app.use('/', authRouter); // Login/registration & profile routes
app.use('/', recipeRouter); 

// Listen to port and log port number
app.listen(port, function () {
  console.log('Node server is running..');
  console.log('Listening at: http://localhost:' + port);
});