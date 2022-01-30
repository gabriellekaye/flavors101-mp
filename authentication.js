exports.isPrivate = (req, res, next) => { // Private pages can be accessed if users are logged-in
    if (req.session.user) {
      return next()
    } else {
      res.redirect('/login');
    }
  };
  
exports.isPublic = (req, res, next) => { // Public pages can't be accessed if users are not logged-in
  if (req.session.user) {
    res.redirect('/');
  } else {
    return next();
  }
}
