const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, min:5, required: true },
    password: { type: String, min: 6, required: true },
    avatar: {type: String, required: true}, 
    description: { type: String, required: false},
  }
);

const user = mongoose.model('user', userSchema);

module.exports = user;