const {body} = require('express-validator');

const registerValidation = [
  // Username cant be empty
  body('username').not().isEmpty().withMessage("Please enter a username."),

  // Username should be at least 6 chars
  body('username').isLength({ min: 6 }).withMessage("Username must be at least 6 characters."),
  
  // Password length must be at least 6 characters
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

  // Confirm pass cant be empty and must match pass
  body('confirmPass').not().isEmpty().withMessage("Please confirm password.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords did not match.");
      }
      return true;
    }),
  
  // Avatar is required
  body('avatar').custom((value, {req}) => {
      if(value == null && req.files == null){
        throw new Error("Please upload an avatar.");
      }
      return true;
    })
  ];

const loginValidation = [
  // Username is required
  body('username').not().isEmpty().withMessage("Please enter your username."),

  // Password is required
  body('password').not().isEmpty().withMessage("Please enter your password.")
];

module.exports = { registerValidation, loginValidation };