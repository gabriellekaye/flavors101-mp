const {body} = require('express-validator');

const registerValidation = [
  // Username is required
  body('username').not().isEmpty().withMessage("Username is required."),
  
  // Password length must be at least 6 characters
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),

  // Confirm Password must match password
  body('confirmPass').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match.");
      }
      return true;
    }),
  
  // Avatar is required
  // body('avatar').not().isEmpty().withMessage("Please upload an avatar."),
];

const loginValidation = [
  // Username is required
  body('username').not().isEmpty().withMessage("Username is required."),

  // Password is required
  body('password').not().isEmpty().withMessage("Password is required.")
];

module.exports = { registerValidation, loginValidation };