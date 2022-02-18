const bcrypt = require('bcrypt'); //For has password
const User = require('../models/user'); // user db 
const Comment = require('../models/comment')
const Recipe = require('../models/recipe'); // recipe db
const Rate = require('../models/rate'); // rate db
const { validationResult } = require('express-validator'); //for validation
const path = require('path')

// Express
const express = require('express')
const app = new express()

// To upload avatar
const fileUpload = require('express-fileupload');
const { constants } = require('crypto');
const recipe = require('../models/recipe');
const { findByIdAndUpdate } = require('../models/user');
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

    const user = await User.findOne({ username }).exec()
    if (user) {
      console.log(user)
      req.flash('error_msg', 'Username exists. Please login.');
      return res.redirect('/login');
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)
    const { avatar: image } = req.files
    // Change file name to username-avatar.jpg
    const fileName = username + '-avatar.jpg';
    const uploadPath = path.resolve('./public/avatars', fileName);
    console.log(fileName);

    await image.mv(uploadPath)
    
    const data = {
      username,
      password: hashed,
      avatar: fileName,
      description
    };

    try {
      const newUser = await User.create(data)
      console.log(newUser);
      req.flash('success_msg', 'Registration successful! Login below.');
      res.redirect('/login');
    } 
    catch (err) {
      req.flash('error_msg', 'Could not create user. Please try again.');
      res.redirect('/register');
    }
  } 
  else {
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

    
    try {
      const user = await User.findOne({ username }).exec()
      if (user) { // User found
        bcrypt.compare(password, user.password, (err, result) => {
          console.log(result, err)
          if (result) { // Passwords match
            // What is stored in sessions
            req.session._id = user._id;
            req.session.username = user.username,
            req.session.avatar = user.avatar,
            req.session.description = user.description,
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
    console.log('logged out and session ended');
    res.status(200);
  }
};

//Delete acct
exports.getDeleteProfile = async (req, res) => {
  await Recipe.updateMany({ $pull: { raters : req.session._id }}); // delete user from raters array
  await Recipe.updateMany({ $pull: { likers : req.session._id }}); // delete user from likers array
  await Recipe.deleteMany({author: req.session.username});  // delete recipes
  
  await Rate.deleteMany({user_id: req.session._id});        // delete rates
  
  await Comment.deleteMany({user_id: req.session._id});     // delete comments
 
  const user = await User.findById({_id : req.session._id});
  const likeCount = user.likes.length;

  if (likeCount > 0){
    for(let i = 0; i < likeCount; i++) {                      // delete likes
      const recipe = await Recipe.findByIdAndUpdate(user.likes[i]);
      const removed = recipe.likes - 1;
      await Recipe.findByIdAndUpdate(user.likes[i], {likes: removed});
    }
  }
  
  await User.deleteOne({_id: req.session._id});             // delete user
  
  req.session.destroy(() => {                               //end session
    res.clearCookie('connect.sid');                         //clear cookies
    res.redirect('/login');                                 //redirect to log in page
    res.status(200);
  });
}

// get edit profile page
exports.getEditProfile = (req, res) => {
  res.render('edit-profile', {
      pageTitle: req.session.username+" | Edit Profile",
      username: req.session.username,
      description: req.session.description,
      avatar: req.session.avatar
  });
};

// Update profile
exports.getUpdateProfile = async (req,res) => {
  let sess = req.session;
  const { username, description, curpassword } = req.body
  const { password } = await User.findById(req.session._id, '-_id password').exec()
  const user = {}

  const user_exists = await User.findOne({ username }).exec()
  console.log(password);
  const result = await bcrypt.compare(curpassword, password);
  
  if(result){
    if(user_exists){
      req.flash('error_msg', 'Username exists. Please try a different username.');
      return res.redirect('/edit-profile');
    }
    if (username) {
      //change author name for users recipes
      await Recipe.updateMany({author: sess.username}, {author: username});
  
      sess.username = username;
      user.username = username;
    }
    
    if (description) {
      sess.description = description;
      user.description = description;
    }
    
    if (req.files) {
      //upload avatar
      const { avatar: image } = req.files;
      // Change file name to username-avatar.jpg
      const fileName = sess.username + '-avatar.' + image.name.split('.')[1]
      const uploadPath = path.resolve('./public/avatars', fileName);
      console.log(fileName)
      await image.mv(uploadPath);
  
      sess.avatar = fileName;
      user.avatar = fileName;
    }
  
    try {
        await User.updateOne({_id: sess._id}, user);
        console.log('Profile edited');
        res.redirect ('/profile'); 
    } catch (err) {
        console.log(err);
    }
  }

  else{
    return res.redirect('/edit-profile');
  }
};

exports.changePassword = async (req, res) => {
  // check old password matches in db
  const { oldPass, newPass, confirmPass } = req.body
  const { password } = await User.findById(req.session._id, '-_id password').exec()
  
  const result = await bcrypt.compare(oldPass, password)

  if (!result) {
    return res.json({ oldPassErr: 'Old password is incorrect' })
  }

  if (newPass?.length < 6) {
    return res.json({ newPassErr: 'New password invalid' })
  }

  if (newPass !== confirmPass) {
    return res.json({ confirmPassErr: 'New password and confirmation do not match' })
  }

  const hash =  await bcrypt.hash(newPass, parseInt(process.env.SALT_ROUNDS))
  await User.updateOne({ _id: req.session._id }, { password: hash })
  res.json({ success: true })
};

//Show my profile 
exports.getProfile = async (req, res) => {
  const max = 5
  const user = await User.findById({_id : req.session._id})

  const recipes = await Recipe.find({_id : user.likes}).limit(max).lean().exec();

  res.render('profile', {
      pageTitle: req.session.username+' | Profile',
      username: req.session.username,
      description: req.session.description,
      avatar: req.session.avatar,
      likes: recipes
  });
};

// Show my recipes page
exports.myRecipes = async (req, res) => {
  const curAuthor = req.session.username
  const max = 10;

  const recipe = await Recipe.find({author : curAuthor }).lean().limit(max);
  res.render('my-recipes', {
    pageTitle: curAuthor + ' | Recipes', 
    recipes: recipe});
};

// Show someone elses profile 
exports.getPublicProfile = async (req,res) => {
  try {
    var otherUser = req.params.id;
    const user = await User.findOne({username : otherUser}).exec();
    const recipe = await Recipe.find({author : otherUser}).lean().exec();
    const data = await Comment.find({ user_id: user._id }).lean().exec()

    const comments = [], replies = []

    for (let i = 0; i < data.length; i++) {
      (data[i].reply_to ? comments : replies).push(data[i])
    }

    res.render('public-profile', {
      pageTitle: user.username + '`s Profile',
      username: user.username,
      description: user.description,
      avatar: user.avatar, 
      recipe,
      comments,
      replies,
    });
  }
  catch (err){
    console.log(err);
  };
};