const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title : {type : String, required : 'This field is required.'},
    description : {type : String, required : 'This field is required'},
    image : {type : String, required : 'This field is required'},
    ingredients : {type : Array, required : 'This field is required'},
    preparation : {type : Array, required : 'This field is required'},
    comments : {type : Array},
    likes : {type : Number}
})

recipeSchema.index({ name : 'text', description : 'text'});
// WildCard Indexing
recipeSchema.index({ "$**" : 'text'});

module.exports = mongoose.model('Recipe', recipeSchema);