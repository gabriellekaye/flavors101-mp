const bcrypt = require('bcrypt'); //For has password
const userModel = require('../models/user'); //Database 
const { validationResult } = require('express-validator'); //for validation
const path = require('path')

// Express
const express = require('express')
const app = new express()

// To upload avatar
const fileUpload = require('express-fileupload')
app.use(fileUpload())

app.use(express.json())
app.use(express.urlencoded( {extended: true}));

// Register
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const { 
      username, 
      password,
      avatar,
      description 
    } = req.body;

    const user = await userModel.findOne({ username }).exec()
    if (user) {
      console.log(user)
      req.flash('error_msg', 'Username exists. Please login.');
      return res.redirect('/login');
    }

    const saltRounds = 10;
    // Hash password
    const hashed = await bcrypt.hash(password, saltRounds)
    const { avatar: image } = req.files
    // Change file name to username-avatar.jpg
    const uploadPath = path.resolve('./public/avatars', username + '-avatar.jpg')

    await image.mv(uploadPath)
    
    const data = {
      username,
      password: hashed,
      avatar: uploadPath,
      description
    };

    try {
      const newUser = await userModel.create(data)
      console.log(newUser);
      req.flash('success_msg', 'Registration successful! Login below.');
      res.redirect('/login');
    } catch (err) {
      req.flash('error_msg', 'Could not create user. Please try again.');
      res.redirect('/register');
      res.status(500).send({ message: "Could not create user"});
    }
  } else {
    const messages = errors.array().map((item) => item.msg);
    console.log(errors)

    req.flash('error_msg', messages.join(' '));
    res.redirect('/register');
  }
};

// Log in
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    const {
      username,
      password
    } = req.body;

    const user = await userModel.findOne({ username }).exec()
    
    try{
      if (user) { // User found
        bcrypt.compare(password, user.password, (err, result) => {
          console.log(result, err)
          if (result) { // Passwords match
            req.session.user = user._id;
            req.session.username = user.username;
            console.log(req.session);
            res.redirect('/');  //redirect to homepage
          } 
          else { // Passwords don't match
            req.flash('error_msg', 'Incorrect password!');
            res.redirect('/login');
          }
        });
      } 
      else { // User not found
        req.flash('error_msg', 'Account does not exist!');
        res.redirect('/register');
      }
    } 
    catch(err) {
        console.log(err);
        req.flash('error_msg', 'Server crashed! Please try again.');
        res.redirect('/login');
    }
  } 
  else {
    const messages = errors.array().map((item) => item.msg);
    req.flash('error_msg', messages.join(' '));
    res.redirect('/login');
  }
};

// Log out
exports.logoutUser = (req, res) => {
  if (req.session) { //Destory session
    req.session.destroy(() => { 
      res.clearCookie('connect.sid'); //clear cookies
      res.redirect('/login'); //redirect to log in page
    });
  }
};

//Show profile
exports.getProfile = (req, res) => {
  const user = { 
    username, 
    password,
    avatar,
    description 
  } = req.body;

  res.render('profile', {
      username: user.username,
      password: user.password,
      description: user.description
  });
}