//Require the schemas
require('../models/db');
const Recipe = require ('../models/recipe');

const RecipeController = {

    //Homepage
    home: async (req, res) => {
        const max = 10;

        const recipe = await Recipe.find({}).limit(max).lean().exec();

        res.render('index', {
            pageTitle: "Home",
            recipes: recipe});
    },

    //Loading the Form
    submitRecipe : async (req, res) =>
    {
        res.render('submit-recipe');
    }, 

    //Saving the form to the Database
    submitRecipeDone : async (req, res) => {
        try 
        {
            // To accept IMAGE
            var uploadedImage;
            var uploadPath;
            var imageName;

            if(!req.files || Object.keys(req.files).length === 0){
                console.log('No image uploaded');
            }

            else
            {
                uploadedImage = req.files.image;
                //to have a unique filename
                imageName = Date.now() + uploadedImage.name;
                uploadPath = require('path').resolve('./') + '/public/uploads/' + imageName;

                uploadedImage.mv(uploadPath, function(err)
                {
                    if(err) return res.status(500).send(err);
                });
            }

            // Saving to DATABASE
            const newRecipe = new Recipe ({
                title : req.body.title,
                description : req.body.description,
                image : imageName,
                ingredients : req.body.ingredients, 
                preparation : req.body.preparation,
                likes : 0,
                author : req.session.username
            })

            //Test
            // console.log('Title: ' + req.body.title);
            // console.log('Description ' + req.body.description);
            // console.log('Image ' + imageName);
            // console.log('Ingredients: ' + req.body.ingredients);
            // console.log('Preparation: ' + req.body.preparation);

            await newRecipe.save()

            console.log('Submitted');

            //Redirect to home
            // res.redirect('/');

            //Redirect to post
            res.redirect('/recipe/' + newRecipe._id);
        } 
        catch (error) {
            console.log('Fail');
            res.redirect('submit-recipe');
        }
    },

    //To show post
    showRecipe : async (req, res) => 
    {
        try {
            //To extract the id from the request
            var recipeId = req.params.id;

            curId = recipeId;

            const recipe = await Recipe.findById(recipeId).lean().exec();

            res.render('recipe', {
                pageTitle: recipe.title,
                recipe: recipe});
        } catch (error) {

        }
    }, 

    //To show a random post
    showRandom : async (req, res) => 
    {
        try {

            //To find a random post
            var count = await Recipe.find().countDocuments();
            var random = Math.floor(Math.random() * count);
            var recipe = await Recipe.findOne().skip(random).lean().exec();

            res.render ('recipe', {
                pageTitle: recipe.title,
                recipe});
        } catch (error) {
            
        }
    },

    //To search for a post based on title
    searchRecipe : async (req, res) =>
    {
        try {
            let searchTerm = req.body.searchTerm;
            
            // let recipes = await Recipe.find({ $text : { $search : searchTerm, $diacriticSensitive : true}});

            let recipes = await Recipe.find({ title: new RegExp(searchTerm, "i")}).lean().exec();

            res.render('search', {
                pageTitle: "Search",
                recipes});

        } catch (error) {
            res.status(500).send({message: error.message || "Error Occured"});  
        }
    },

    //To render update form
    updateRecipe : async  (req, res) => 
    {
        try {
            //To extract the id from the request
            var recipeId = req.params.id;
            const recipe = await Recipe.findById(recipeId).lean().exec();

            res.render('edit', {
                pageTitle: recipe.title + " | Edit",
                recipe});
        } catch (error) {

        }
    },

    //To udpate recipe and render it afterwards
    updateRecipeDone : async (req, res) =>
    {
        //To get the ID
        const curid = req.params.id;

        const { title, description, image, ingredients, preparation } = req.body

        const curRecipe = await Recipe.findById(curid).lean().exec();

        // console.log('Title ' + curRecipe.title);

        //To save image
        var uploadedImage;
        var uploadPath;
        var imageName;

        if(!req.files || Object.keys(req.files).length === 0){
            console.log('No image uploaded');
        }

        else
        {
            uploadedImage = req.files.image;
            //to have a unique filename
            imageName = Date.now() + uploadedImage.name;
            uploadPath = require('path').resolve('./') + '/public/uploads/' + imageName;

            uploadedImage.mv(uploadPath, function(err)
            {
                if(err) return res.status(500).send(err);
            });
        }
    
        const updatedRecipe = {
            title: title || curRecipe.title,
            description: description || curRecipe.description,
            image: imageName,
            ingredients : ingredients || curRecipe.ingredients,
            preparation : preparation || curRecipe.preparation,
            likes : curRecipe.likes,
            comments : curRecipe.comment,
            author : curRecipe.author
        }

        Recipe.findOneAndUpdate({_id: curid}, updatedRecipe, function(err, succ)
        {
            if(err)
                console.log(err);
            else
                console.log('Recipe Updated');
        });

        //to return to home after updating
        res.redirect('/recipe/' + curid);
    }, 

    //To delete recipe
    deleteRecipe : async (req, res) => 
    {
        const curid = req.params.id;

        Recipe.deleteOne({_id: curid}, function(){
            //to return to home after deleting
            res.redirect('/');
            console.log('Recipe Deleted');
        });
    },

    //To comment on a recipe
    commentRecipe : async (req, res) =>
    {
        const curid = req.params.id;
        const comment = req.body.comment;

        Recipe.findByIdAndUpdate({_id : curid}, { $push: { comments : comment } }, function (err, docs) 
        {
            if (err){
                console.log(err)
            }
            else{
                console.log("Commented");
            }
        });

        res.redirect('/recipe/' + curid);
    },

    likeRecipe : async (req, res) =>
    {
        const curid = req.params.id;
        const curRecipe = await Recipe.findById(curid);
        const likes = curRecipe.likes + 1;

        Recipe.findByIdAndUpdate({_id : curid}, {likes : likes}, function (err, docs) 
        {
            if (err){
                console.log(err)
            }
            else{
                console.log("Liked");
            }
        });

        res.redirect('/recipe/' + curid);
    }
}   

module.exports = RecipeController;