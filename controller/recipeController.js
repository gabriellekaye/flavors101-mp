//Require the schemas
require('../models/db');
const  mongoose = require('mongoose');
const Recipe = require ('../models/recipe');
const User = require ('../models/user');
const Comment = require('../models/comment');
const Rate = require('../models/rate');
const { findOneAndDelete } = require('../models/recipe');

const RecipeController = {

    //Homepage
    home: async (req, res) => {
        const max = 10;

        const recipe = await Recipe.find({}).limit(max).lean().exec();

        res.render('index', {
            pageTitle: "Flavors 101",
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
                author : req.session.username,
                average : 0
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

            const recipe = await Recipe.findById(recipeId).lean().exec();

            const comments = await Comment.find({ recipe: recipeId , reply_to: null}, '-__v').populate('user_id', 'username').lean().exec()
            
            for (let i = 0; i < comments.length; i++) {
                const replies = await Comment.find({ reply_to: comments[i]._id })
                    .populate('user_id', 'username').lean().exec()
                comments[i].replies = replies
            }

            recipe.comments = comments
           
            //Recipes can only be edited by author
            if(recipe.author === req.session.username)
            {
                res.render('recipe', {
                pageTitle: recipe.title,
                recipe: recipe,
                loggedin: req.session._id});
            }

            else
            {
                res.render('uneditableRecipe', {
                pageTitle: recipe.title,
                recipe: recipe,
                });
            }

            // res.render('recipe', {
            //     pageTitle: recipe.title,
            //     recipe: recipe});
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
            var recipeId = recipe._id;
            const comments = await Comment.find({ recipe: recipeId , reply_to: null}, '-__v').populate('user_id', 'username').lean().exec();
            
            for (let i = 0; i < comments.length; i++) {
                const replies = await Comment.find({ reply_to: comments[i]._id })
                    .populate('user_id', 'username').lean().exec()
                comments[i].replies = replies
            }

            recipe.comments = comments

            //Recipes can only be edited by author
            if(recipe.author === req.session.username)
            {
                res.render('recipe', {
                pageTitle: recipe.title,
                recipe: recipe});
            }

            else
            {
                res.render('uneditableRecipe', {
                pageTitle: recipe.title,
                recipe: recipe});
            }

            // res.render ('recipe', {
            //     pageTitle: recipe.title,
            //     recipe});
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
                pageTitle: "Search " + searchTerm,
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
                pageTitle: recipe.title + " | Edit Recipe",
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
            author : curRecipe.author,
            rate : curRecipe.rate, 
            average : curRecipe.average
        }

        Recipe.findOneAndUpdate({_id: curid}, updatedRecipe, function(err, succ)
        {
            if(err)
                console.log(err);
            else
                console.log('Recipe Updated');
        });

        //refresh to edited recipe
        res.redirect('/recipe/' + curid);
    }, 

    //To delete recipe
    deleteRecipe : async (req, res) => 
    {
        const curid = req.params.id;

        //remove from all users likes
        const { likers } = await Recipe.findById(curid, '-username,likers').lean().exec()
        await User.updateMany({"username": { "$in": likers}}, {$pull: { likes : curid }}).exec();

        Recipe.deleteOne({_id: curid}, function(){
            // return to home after deleting
            res.redirect('/');
        });
    },

    //To comment on a recipe
    commentRecipe : async (req, res) =>
    {
        const curid = req.params.id;
        const {comment, reply_to} = req.body;
        console.log(reply_to);

        
        await Comment.create({
            text: comment,
            user_id: req.session._id,
            reply_to: reply_to,
            recipe: curid,
            likes : 0
        })

        // const comment = {text: req.body.comment,
        //                 c_id: new mongoose.Types.ObjectId(),
        //                 user_id: req.session._id
        // }
        
        // Recipe.findByIdAndUpdate({_id : curid}, { $push: { comments : comment } }, function (err, docs) 
        // {
        //     if (err){
        //         console.log(err)
        //     }
        //     else{
        //         console.log("Commented");
        //     }
        // });

        res.redirect('/recipe/' + curid);
    },

    //To delete comment
    deleteComment : async (req, res) => 
    {
        const {comment} = req.body;
        const curid = req.params.id;
    
        Comment.deleteOne({_id: comment}, function(){
            Comment.deleteMany({reply_to: comment}, function(){
                res.redirect('/recipe/' + curid);
                console.log('Comment Deleted');
            })
            
        });
    },

    //To like comment
    likeComment : async(req, res) =>
    {
        const {id} = req.body;
        const curid = req.params.id;

        const curComment = await Comment.findById(id);

        const user = req.session.username;

        var found = 0;

        for(var i = 0 ; i < curComment.likers.length ; i++)
        {
            if(user === curComment.likers[i])
            {
                found = 1;
            }
        };

        if(found)
        {
            const likes = curComment.likes - 1;
            await Comment.findByIdAndUpdate({_id : id}, { $pull:  { likers: user } });
            await Comment.findByIdAndUpdate({_id : id}, {likes : likes});
            res.redirect('/recipe/' + curid);
        }

        else if (!found)
        {
            const likes = curComment.likes + 1;
            await Comment.findByIdAndUpdate({_id : id}, {$push: {likers : user}});
            await Comment.findByIdAndUpdate({_id : id}, {likes : likes});
            res.redirect('/recipe/' + curid);
        }


        // const likes = curComment.likes + 1;

        // Comment.findByIdAndUpdate({_id : id}, {likes : likes}, function (err, docs) 
        // {
        //     if (err){
        //         console.log(err)
        //     }
        //     else{
        //         console.log("Comment Liked");
        //     }
        // });

        // res.redirect('/recipe/' + curid);
    },

    //To render update comment
    editComment : async  (req, res) => 
    {
        try {
            const {id} = req.body;
            var recipeId = req.params.id;
            const recipe = await Recipe.findById(recipeId).lean().exec();
            const comment = await Comment.findById(id).lean().exec();
             console.log(comment);
            res.render('edit-comment', {
                _id: id,
                 comment})
            }catch (error) {

        }
    },
    //To udpate recipe and render it afterwards
    updateComment : async (req, res) =>
    {
        //To get the ID
        const curID = req.params.id;

        const { id, text } = req.body

        const curComment = await Comment.findById(id).lean().exec();
        console.log(id);
        // console.log('Title ' + curRecipe.title);
        
        const updatedComment = {
            text: text || curComment.text,
            user_id: curComment.user_id,
            recipe: curComment.recipe,
            reply_to : curComment.reply_to,
            likes : curComment.likes
        }

        Comment.findOneAndUpdate({_id: id}, updatedComment, function(err, succ)
        {
            if(err)
                console.log(err);
            else
                console.log('Comment Updated');
        });
        res.redirect('/recipe/' + curComment.recipe);
    },

    likeRecipe : async (req, res) =>
    {
        const curid = req.params.id;
        const curRecipe = await Recipe.findById(curid);
        const user = req.session.username;

        var found = 0;

        var no_likers = curRecipe.likes;

        if(no_likers > 0) {
            for(var i = 0 ; i < curRecipe.likers.length ; i++) {
                if(user === curRecipe.likers[i]){
                    found = 1;
                }
            };
        };

        // unlike
        if(found == 1) { 
            const likes = curRecipe.likes - 1;
            await User.updateOne({ _id: req.session._id }, { $pull: { likes : curid } });
            await Recipe.updateOne({_id: curid}, { $pull: { likers : user } });
            await Recipe.findByIdAndUpdate({_id : curid}, {likes : likes});
        }

        // like
        else if (found == 0) {
            const likes = curRecipe.likes + 1;
            await User.updateOne({ _id: req.session._id }, { $push: { likes : curid } });
            await Recipe.updateOne({_id: curid}, { $push: { likers : user } });
            await Recipe.findByIdAndUpdate({_id : curid}, {likes : likes});
        };

        res.redirect('/recipe/' + curid);
    },

    //To rate a recipe
    rateRecipe : async (req, res) =>
    {
        const curid = req.params.id;
        const curRecipe = await Recipe.findById(curid);
        const chosenRate = req.body.rate;
        const user = req.session.username;

        var found = 0;
        var currate = curRecipe.average;

        if(currate > 0){
            for(var i = 0 ; i < curRecipe.raters.length ; i++) {
                if(user === curRecipe.raters[i]){
                    found = 1;
                }
            };  
        }   

        // user has not rated
        if(found == 0){
            await Rate.create({ //create new rate
                value: chosenRate,
                user_id: req.session._id,
                recipe: curid,
            });
            // add user id to raters array
            await Recipe.updateOne({_id:curid}, { $push: { raters : req.session.username } });
        }

        // user has rated recipe
        else if (found == 1) {
            //update rate
            if (chosenRate > 0){
                await Rate.updateOne({user_id:req.session._id, recipe:curid}, {value:chosenRate});
            };
        };

        // COMPUTE AVERAGE
        // Get # of rates
        var div = await Rate.count({recipe:curid});
        
        // Get sum of rates
        result = await Rate.aggregate([
            { $match: { recipe: curid } },
            { $group: { _id: "_id", total: { $sum: "$value"} } }
        ]);

        // compute for average
        var avg = result[0].total/div
        //console.log('average is ' + avg);

        // Update avg in recipe
        await Recipe.findByIdAndUpdate(curid, {average:avg,});

        res.redirect('/recipe/' + curid); // refresh page
    },

    // Delete rate
    deleteRate_Recipe : async (req, res) =>
    {
        const curid = req.params.id;
        const curuser = req.session._id;
        const curRecipe = await Recipe.findById(curid);
        const user = req.session.username;
        var found = 0;

        for(var i = 0 ; i < curRecipe.raters.length ; i++) {
            if(user === curRecipe.raters[i]){
                found = 1;
            }
        };
        
        if(found == 1) {
            // Delete rate from db
            await Rate.deleteOne({recipe:curid, user_id:curuser});
            console.log('deleted rate from rate db');
        };

        // RECOMPUTE FOR AVERAGE 
        // Get # of rates
        var div = await Rate.count({recipe:curid});
        var avg;

        if(div == 0) { //no more rates
            avg = 0;

        }
        
        else { //other rates still present
            // Get sum of rates
            result = await Rate.aggregate([
                { $match: { recipe: curid } },
                { $group: { _id: "_id", total: { $sum: "$value"} } }
            ]);

            // compute for average
            avg = result[0].total/div
        };
        
        // Update avg in recipe
        await Recipe.findByIdAndUpdate(curid, {average:avg});
        // remove username from raters array
        await Recipe.updateOne({_id:curid}, { $pull: { raters : req.session.username } });

        res.redirect('/recipe/' + curid); // refresh page
    }
};

module.exports = RecipeController;