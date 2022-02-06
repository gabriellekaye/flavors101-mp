const express = require('express');
const router = express.Router();

const { isPrivate } = require('../middlewares/authentication');

//Require the controller to use it
const recipeController = require('../controller/recipeController');

//Route to homepage
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

// //To delete a recipe/post
router.delete('/delete/:id', isPrivate, recipeController.deleteRecipe);

//To update a recipe/post
router.get('/update/:id', isPrivate, recipeController.updateRecipe);

// to show updated recipe
router.post('/update/:id', isPrivate, recipeController.updateRecipeDone);

//To comment on a recipe
router.post('/comment/:id', isPrivate, recipeController.commentRecipe);

//To like a recipe
router.post('/like/:id', isPrivate, recipeController.likeRecipe);

module.exports = router;