// All imports needed here
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const fileUpload = require('express-fileupload')

// get environment variables
require('dotenv').config()
const dbUri = process.env.SERVER_DB_URI
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}
const secret = process.env.SECRET
const port = 3000;

mongoose.connect(dbUri, options, (err) => {
  console.log(err? err : 'Established connection with MongoDB!');
})

// storage for user session
const store = new mongoStore({
  uri: dbUri,
  databaseName: 'flavors101',
  collection: 'sessions'
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
  //layoutsDir: path.join(__dirname, '/views/layouts'),
  //partialsDir: path.join(__dirname, '/views/partials'),
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
}))

// Setting the view engine to the express-handlebars engine we created
app.set('view engine', 'hbs');

// serve static files
app.use('/public', express.static('public'));

// Flash
app.use(flash());

// Global messages vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Routes imports
const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');

app.use('/', homeRouter); // Home/index route
app.use('/', authRouter); // Login/registration & profile routes

// Listen to port and log port number
app.listen(port, function () {
  console.log('Node server is running..');
  console.log('Listening at: http://localhost:' + port);
});