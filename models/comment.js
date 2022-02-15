const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {type : String},
    user_id: {type: String, require, ref: 'user'},
    recipe: {type: mongoose.ObjectId, require: true, ref: 'Recipe'},
    reply_to: {type: mongoose.ObjectId, require: true, ref: 'Comment', default: null}
})

module.exports = mongoose.model('Comment', commentSchema);