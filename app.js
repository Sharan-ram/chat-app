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

let defaultRoom = "";
io.on("connection", function(socket) {
  socket.on("addUser", name => {
    socket.room = defaultRoom;
    socket.username = name;

    db.lrange(socket.username, 0, -1, (err, roomArr) => {
      if (err) console.log(err);
      else socket.emit("renderRooms", roomArr);
    });
  });

  socket.on("loadRoomContent", current_room => {
    socket.leave(socket.room);
    socket.join(current_room);
    socket.room = current_room;
    //console.log(socket.room, socket.username);
    socket.emit("clearConversationDom", socket.room);
    db.lrange(`${socket.room}:users`, 0, -1, (err, users) => {
      socket.emit("clearUsersDom", users);
      socket.emit("displayUsers", users);
    });

    db.lrange(socket.room, 0, -1, (err, roomContent) => {
      if (err) console.log(err);
      //console.log("content of a room  in an array ", roomContent);
      roomContent.forEach(message => {
        message = message.replace(/\"/g, "");
        db.hgetall(message, (err, msgObj) => {
          socket.emit("renderRoomContent", msgObj);
        });
      });
    });
  });

  socket.on("saveText", data => {
    db.incr("message:ids", (err, id) => {
      if (err) console.log(err);
      db.hmset(`message:${id}`, "username", socket.username, "data", data);
      db.rpush(socket.room, JSON.stringify(`message:${id}`));
      io.in(socket.room).emit("updateChat", socket.room);
    });
  });

  socket.on("renderChatToEveryone", room => {
    socket.emit("clearConversationDom", socket.room);
    db.lrange(socket.room, 0, -1, (err, roomContent) => {
      if (err) console.log(err);
      //console.log("content of a room  in an array ", roomContent);
      roomContent.forEach(message => {
        message = message.replace(/\"/g, "");
        db.hgetall(message, (err, msgObj) => {
          socket.emit("renderRoomContent", msgObj);
        });
      });
    });
  });

  socket.on("addGroup", (groupName, user) => {
    db.lpush(socket.username, groupName);
    db.lpush(`${groupName}:users`, user, socket.username);
    db.lpush(user, groupName);
    db.lrange(socket.username, 0, -1, (err, roomArr) => {
      socket.emit("renderRooms", roomArr);
    });
  });

  socket.on("disconnect", function() {
    socket.leave(socket.room);
  });
});

http.listen(port, () => {
  console.log("listening on port :", port);
});
