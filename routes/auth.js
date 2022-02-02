const router = require('express').Router();
const userController = require('../controller/userContorller');
const { registerValidation, loginValidation } = require('../validators');
const { isPublic, isPrivate } = require('../middlewares/authentication');

// GET login to display login page
router.get('/login', isPublic, (req, res) => {
  res.render('login', {
    pageTitle: 'Login',
  });
});

// GET register to display registration page
router.get('/register', isPublic, (req, res) => {
  res.render('register', {
    pageTitle: 'Registration',
  });
});

// POST methods for form submissions
router.post('/register', isPublic, registerValidation, userController.registerUser);
router.post('/login', isPublic, loginValidation, userController.loginUser);

// get logout
router.get('/logout', isPrivate, userController.logoutUser);

// delete acct
router.get('/deleteact', isPrivate, userController.deleteUser);

// get profile 
router.get('/profile', isPrivate, userController.getProfile);

module.exports = router;
