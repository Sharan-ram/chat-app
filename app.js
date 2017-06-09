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
var usernames = {};

var rooms = ["room1", "room2", "room3"];

io.sockets.on("connection", function(socket) {
  socket.on("adduser", function(username) {
    socket.username = username;

    socket.room = "room1";

    usernames[username] = username;

    socket.join("room1");

    socket.emit("updatechat", "SERVER", "you have connected to room1");

    socket.broadcast
      .to("room1")
      .emit("updatechat", "SERVER", username + " has connected to this room");
    socket.emit("updaterooms", rooms, "room1");
  });

  socket.on("sendchat", function(data) {
    io.sockets.in(socket.room).emit("updatechat", socket.username, data);
  });

  socket.on("switchRoom", function(newroom) {
    socket.leave(socket.room);

    socket.join(newroom);
    socket.emit("updatechat", "SERVER", "you have connected to " + newroom);

    socket.broadcast
      .to(socket.room)
      .emit("updatechat", "SERVER", socket.username + " has left this room");

    socket.room = newroom;
    socket.broadcast
      .to(newroom)
      .emit("updatechat", "SERVER", socket.username + " has joined this room");
    socket.emit("updaterooms", rooms, newroom);
  });

  socket.on("disconnect", function() {
    delete usernames[socket.username];

    io.sockets.emit("updateusers", usernames);

    socket.broadcast.emit(
      "updatechat",
      "SERVER",
      socket.username + " has disconnected"
    );
    socket.leave(socket.room);
  });
});

// listen on port 3000
http.listen(port, () => {
  console.log("listening on port :", port);
});
