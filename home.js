const router = require('express')();
const { isPrivate } = require('../middlewares/authentication');

router.get('/', isPrivate, (req, res) => {
  res.render('home', { pageTitle: 'Home', name: req.session.username } );
});

module.exports = router;
