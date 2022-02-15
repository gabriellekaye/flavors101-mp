const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
    value: {type : Number, required: true, default: 0},
    user_id: {type: String, required: true},
    recipe: {type: String, required: true}
})

module.exports = mongoose.model('Rate', rateSchema);