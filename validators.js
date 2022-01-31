const {body} = require('express-validator');

const registerValidation = [
  // Username is required
  body('username').not().isEmpty().withMessage("Username is required"),
  
  // Password length must be at least 6 characters
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  // Confirm Password must match password
  body('confirmPass').isLength({ min: 6 }).withMessage("Confirm password must be at least 6 characters")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords did not match");
      }
      return true;
    }),
  
  // Avatar is required
  //body('avatar')
  //  .custom((value, {req}) => {
  //})
  ];

const loginValidation = [
  // Username is required
  body('username').not().isEmpty().withMessage("Please enter your username."),

  // Password is required
  body('password').not().isEmpty().withMessage("Please enter your password.")
];

module.exports = { registerValidation, loginValidation };