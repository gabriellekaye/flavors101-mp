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

// // GET register to display registration page
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
router.post('/delete', isPrivate, userController.getDeleteProfile);

// get profile 
router.get('/profile', isPrivate, userController.getProfile);

// edit profile
router.get('/edit-profile', isPrivate, userController.getEditProfile);

// updated profile
router.post('/update-profile', isPrivate, userController.getUpdateProfile);

// change password
router.post('/update-password', isPrivate, userController.changePassword);

// get abt page
router.get('/about', (req, res) => {
  res.render('about', {
    pageTitle: 'About Us',
  });
});

module.exports = router;
