const router = require('express')();
const { isPrivate } = require('../middlewares/authentication');

router.get('/home', isPrivate, (req, res) => {
  res.render('home', { 
    pageTitle: 'Home', username: req.session.username });
});

module.exports = router;
