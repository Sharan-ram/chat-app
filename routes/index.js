exports.display = (req, res) => {
  if (req.session && req.session.id) {
    res.render("index", { title: "chat-app", name: req.session.name });
  }
};
