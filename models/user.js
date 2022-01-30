const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, min:5, required: true },
    password: { type: String, min: 6, required: true },
    avatar: {type: String, required: true}, 
    description: { type: String, required: false},
    date: { type: Date, default: Date.now }
  }
);

module.exports = mongoose.model('user', userSchema);

// // Saving a user given the validated object
// exports.create = function(obj, next) {
//     const user = new User(obj);

//   user.save(function(err, user) {
//     next(err, user);
//   });
// };

// // Retrieving a user based on ID
// exports.getById = function(id, next) {
//   User.findById(id, function(err, user) {
//     next(err, user);
//   });
// };

// Retrieving just ONE user based on a query (first one)
// exports.getOne = function(query, next) {
//   User.findOne(query, function(err, user) {
//     next(err, user);
//   });
// };