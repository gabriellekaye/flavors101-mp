const express = require('express');
const router = express.Router();

// All these pages will be private
const { isPrivate } = require('../middlewares/authentication');

//Require the controller to use it
const recipeController = require('../controller/recipeController');

///Route to homepage
router.get('/', isPrivate, recipeController.home);

//Submit forms
router.get('/submit-recipe', isPrivate, recipeController.submitRecipe);
router.post('/submit-recipe', isPrivate, recipeController.submitRecipeDone);

//To display info about recipe/post
router.get('/recipe/:id', isPrivate, recipeController.showRecipe);

//To display a random recipe/post
router.get('/random-recipe', isPrivate, recipeController.showRandom);

//To search for a recipe/post based on title
router.post('/search', isPrivate, recipeController.searchRecipe);

//To delete a recipe/post
router.post('/delete/:id', isPrivate, recipeController.deleteRecipe);

//To update a recipe/post
router.get('/update/:id', isPrivate, recipeController.updateRecipe);

//To show updated recipe/post
router.post('/update/:id', isPrivate, recipeController.updateRecipeDone);

//To comment on a recipe
router.post('/comment/:id', isPrivate, recipeController.commentRecipe);

//To delete a comment
router.post('/:id/delete-comment', isPrivate, recipeController.deleteComment);

//to show edit comment page
router.post('/:id/edit', isPrivate, recipeController.editComment);

//To update a comment
router.post('/:id/update-comment', isPrivate, recipeController.updateComment);

//To like a recipe
router.post('/like/:id', isPrivate, recipeController.likeRecipe);

//To unlike a recipe
router.post('/unlike/:id', isPrivate, recipeController.unlikeRecipe);

//To rate a recipe
router.post('/rate/:id', isPrivate, recipeController.rateRecipe)

module.exports = router;