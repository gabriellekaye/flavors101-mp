const router = require('express').Router();
const userController = require('../controller/userContorller');
const { registerValidation, loginValidation } = require('../validators');
const { isPublic, isPrivate } = require('../middlewares/authentication');

// get sign-in
 router.get('/login', isPublic, (req, res) => {
   res.render('login', {
     pageTitle: 'Login',
   });
 });

// // get sign up
 router.get('/register', isPublic, (req, res) => {
   res.render('register', {
     pageTitle: 'Sign Up',
   });
 });

// POST methods for form submissions in reg and login
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

// get my recipes page
router.get('/myRecipes', isPrivate, userController.myRecipes);

module.exports = router;
