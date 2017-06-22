const User = require("../models/user");
exports.form = (req, res) => {
  res.render("login", { title: "Login" });
};
exports.submit = (req, res, next) => {
  const data = req.body;
  //console.log(data["username"], data["password"]);
  User.authenticate(data["username"], data["password"], (err, user) => {
    if (err) return next(err);
    if (user) {
      //console.log(user);
      req.session.uid = user.id;
      req.session.name = user.name;
      res.redirect("/chat");
    } else {
      res.error("invalid credentials");
      res.redirect("back");
    }
  });
};
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
};
