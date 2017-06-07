const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 3000;
const path = require("path");

// rendering ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// rendering static files
app.use(express.static(path.join(__dirname, "public")));

// on get request to '/' render index.ejs
app.get("/", (req, res) => {
  res.render("index", { title: "Chat App" });
});
io.on("connection", socket => {
  console.log("user connected");
  socket.on("chat message", msg => {
    console.log("message :" + msg);
  });
});

// listen on port 3000
http.listen(port, () => {
  console.log("listening on port :", port);
});
