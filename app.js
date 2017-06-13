const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 3000;
const path = require("path");
const register = require("./routes/register.js");
const messages = require("./middleware/messages.js");
const session = require("express-session");
const bodyParser = require("body-parser");
const login = require("./routes/login");
const user = require("./middleware/user");

// rendering ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// rendering static files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
  })
);
app.use(user);
app.use(messages);
// on get request to '/' render index.ejs
app.get("/", (req, res) => {
  if (req.session.uid) {
    res.render("index", { title: "Chat App" });
  } else {
    res.render("login", { title: "login" });
  }
});
app.get("/register", register.form);
app.post("/register", register.submit);
app.get("/login", login.form);
app.post("/login", login.submit);
app.get("/logout", login.logout);
var usernames = {};

var rooms = ["room1", "room2", "room3"];

io.on("connection", function(socket) {
  socket.on("adduser", function(username) {
    socket.username = username;
    socket.room = "room1";
    usernames[username] = username;
    socket.join("room1");
    socket.emit("updatechat", "admin", "you have connected to room1");
    socket.broadcast
      .to("room1")
      .emit("updatechat", "admin", username + " has connected to this room");
    socket.emit("updaterooms", rooms, "room1");
  });

  socket.on("sendchat", function(data) {
    io.in(socket.room).emit("updatechat", socket.username, data);
  });

  socket.on("switchRoom", function(newroom) {
    console.log(newroom);
    socket.leave(socket.room);
    socket.join(newroom);
    socket.emit("updatechat", "admin", "you have connected to " + newroom);
    socket.broadcast
      .to(socket.room)
      .emit("updatechat", "admin", socket.username + " has left this room");
    socket.room = newroom;
    socket.broadcast
      .to(newroom)
      .emit("updatechat", "admin", socket.username + " has joined this room");
    socket.emit("updaterooms", rooms, newroom);
  });

  socket.on("disconnect", function() {
    delete usernames[socket.username];
    io.emit("updateusers", usernames);
    socket.broadcast.emit(
      "updatechat",
      "admin",
      socket.username + " has disconnected"
    );
    socket.leave(socket.room);
  });
});

http.listen(port, () => {
  console.log("listening on port :", port);
});
