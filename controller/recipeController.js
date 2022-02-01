const Recipe = require ('../models/recipe');

//To save the ID of the current post selected
var curId;

//Homepage
exports.home = async (req, res) => 
{
    //Only 5 posts will be posted
    const max = 5;
    const recipes = await Recipe.find({}).limit(max);
    res.render('index', {recipes});
}

//Loading the Form
exports.submitRecipe = async (req, res) => {
    res.render('submit-recipe');
}

//Saving the form to the Database
exports.submitRecipeDone = async (req, res) => {
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
            preparation : req.body.preparation
        })

        //Test
        console.log('Title: ' + req.body.title);
        console.log('Description ' + req.body.description);
        console.log('Image ' + imageName);
        console.log('Ingredients: ' + req.body.ingredients);
        console.log('Preparation: ' + req.body.preparation);

        await newRecipe.save()

        console.log('Submitted');
        res.redirect('submit-recipe')
    } 
    catch (error) {
        console.log('Fail');
        res.redirect('submit-recipe');
    }
}

//To show post
exports.showRecipe = async (req, res) => 
{
    try {
        //To extract the id from the request
        var recipeId = req.params.id;

        curId = recipeId;

        const recipe = await Recipe.findById(recipeId);

        res.render('recipe', {recipe});
    } catch (error) {

    }
}


//To show a random post
exports.showRandom = async (req, res) => 
{
    try {

        //To find a random post
        var count = await Recipe.find().countDocuments();
        var random = Math.floor(Math.random() * count);
        var recipe = await Recipe.findOne().skip(random).exec();

        res.render ('random', {recipe});
    } catch (error) {
        
    }
}

//To search for a post based on title
exports.searchRecipe = async (req, res) =>
{
    try {
        let searchTerm = req.body.searchTerm;
        let recipes = await Recipe.find({ $text : { $search : searchTerm, $diacriticSensitive : true}});
        res.render('search', {recipes});

    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured"});  
    }
}

//To delete a post
exports.deleteRecipe = async (req, res) =>
{
    const id = req.params.id;

    Post.findByIdAndDelete(id)
        .then(result => {
            res.json({redirect : '/'})
        })
        .catch (err => {
            console.log(err);
        })
}


//To update a post
exports.updateRecipe = async (req, res) =>
{
    // const id = req.params.id;
    // Post.findByIdAndUpdate({_id : req.params.id}, req.body)
    //     .then(function)
    // const id = req.params.id;
    let recipe = await Recipe.findById(curId);


    res.render('edit', {recipe});
}









//Update a post
// async function updatePost ()
// {
//     try {
        
//       const res = await Post.updateOne({name : 'New Recipe'}, {name : 'New Recipe Updated'})  
//       res.n; //Number of documents matched
//       res.nModified; //Number of documents modified
//     } catch (error) {
//       console.log(error);
//     }
// }
// updatePost();

//Delete a post
// async function updatePost ()
// {
//     try {
        
//       const res = await Post.deleteOne({name : 'New Recipe'})  
//     } catch (error) {
//       console.log(error);
//     }
// }
// deletePost();


//Delete a post
// exports.deletePost = async (req, res) => 
// {
//     try {  
//       await Post.deleteOne({_id : curId});
//       res.redirect('index')  
//     } catch (error) {
//       console.log(error);
//     }
// }

// Update post
// exports.updatePost = async (req, res) =>
// {
//     try {
        
//         const res = await Post.updateOne({name : 'New Recipe'}, {name : 'New Recipe Updated'})  
//         res.n; //Number of documents matched
//         res.nModified; //Number of documents modified
//       } catch (error) {
//         console.log(error);
//       }
// }