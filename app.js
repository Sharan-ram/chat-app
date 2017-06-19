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
const redis = require("redis");
const db = redis.createClient();

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
//app.use(user);
app.use(messages);
// on get request to '/' render index.ejs

app.get("/", (req, res) => {
  res.render("login", { title: "Login" });
});

app.get("/register", register.form);
app.post("/register", register.submit);
app.get("/login", login.form);
app.post("/login", login.submit);
app.get("/logout", login.logout);

io.on("connection", function(socket) {
  socket.on("adduser", function(username) {
    socket.username = username;
    socket.room = "room1";

    socket.join("room1");
    socket.emit(
      "updatechat",
      "admin",
      "you have connected to room1",
      socket.room
    );
    socket.broadcast
      .to("room1")
      .emit(
        "updatechat",
        "admin",
        username + " has connected to this room",
        socket.room
      );
    db.lrange("rooms", 0, -1, (err, res) => {
      if (err) return next(err);
      socket.emit("updaterooms", res, "room1");
    });
  });
  socket.on("saveChat", (username, data, room) => {
    //console.log(username, data, room);
    //console.log("the current room is:" + room);
    db.incr(`message:ids`, (err, id) => {
      if (err) return next(err);
      db.hmset(`message:${id}`, "username", username, "data", data);
      db.rpush(room, JSON.stringify(`message:${id}`));
    });
  });

  socket.on("sendchat", function(data) {
    io.in(socket.room).emit("updatechat", socket.username, data, socket.room);
  });

  socket.on("switchRoom", function(newroom) {
    //console.log(newroom);
    socket.leave(socket.room);
    socket.join(newroom);
    socket.emit(
      "updatechat",
      "admin",
      "you have connected to " + newroom,
      newroom
    );
    socket.broadcast
      .to(socket.room)
      .emit(
        "updatechat",
        "admin",
        socket.username + " has left this room",
        socket.room
      );
    socket.room = newroom;
    socket.broadcast
      .to(newroom)
      .emit(
        "updatechat",
        "admin",
        socket.username + " has joined this room",
        socket.room
      );
    db.lrange("rooms", 0, -1, (err, res) => {
      if (err) return next(err);
      socket.emit("updaterooms", res, socket.room);
    });
  });

  socket.on("disconnect", function() {
    socket.broadcast.emit(
      "updatechat",
      "admin",
      socket.username + " has disconnected",
      socket.room
    );
    socket.leave(socket.room);
  });
});

http.listen(port, () => {
  console.log("listening on port :", port);
});
