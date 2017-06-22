const User = require("../models/user");

exports.form = (req, res) => {
  res.render("register", { title: "Register" });
};
exports.submit = (req, res, next) => {
  const data = req.body;
  console.log(data["username"]);
  User.getByName(data["username"], (err, user) => {
    if (err) return next(err);
    if (user.id) {
      res.error("Username already taken");
      res.redirect("back");
    } else {
      user = new User({ name: data["username"], pass: data["userpass"] });
      user.save(err => {
        if (err) return next(err);
        req.session.id = user.id;
        req.session.name = user.name;
        console.log(req.session.id);
        res.redirect("/");
      });
    }
  });
};
