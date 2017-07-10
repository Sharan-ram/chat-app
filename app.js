const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 5555;
const path = require("path");
const register = require("./routes/register.js");
const messages = require("./middleware/messages.js");
const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});
const bodyParser = require("body-parser");
const login = require("./routes/login");
const getUserGroups = require("./models/getUserGroups");
const getUsersFromGroup = require("./models/getUsersFromGroup");
const groupContent = require("./models/groupContent");
const messageContent = require("./models/messageContent");
const User = require("./models/user");
const chat = require("./routes/index.js");
const GroupAdmins = require("./models/groupAdmins");
const DeleteUser = require("./models/deleteUser");
const cookieParser = require("cookie-parser");
const sharedsession = require("express-socket.io-session");
// rendering ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// rendering static files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(session);
io.use(
  sharedsession(session, {
    autoSave: true
  })
);
//app.use(user);
app.use(messages);
// on get request to '/' render index.ejs

app.get("/", login.form);

app.get("/register", register.form);
app.post("/register", register.submit);
app.get("/login", login.form);
app.post("/login", login.submit);
app.get("/logout", login.logout);
app.get("/chat", chat.display);

let defaultRoom = "";
let username = "";
let socketDetailArr = [];
io.on("connection", socket => {
  getUsername(socket);
  createSocketDetailArr(socket);
  setDefaultRoom(socket);
  getGroups(socket);
  switchUserGroup(socket);
  saveUserChat(socket);
  createGroup(socket);
  fetchUsersFromGroup(socket);
  deleteUser(socket);
  addNewUser(socket);
  exitFromGroup(socket);
  deleteGroup(socket);
  disconnect(socket);
});

const getUsername = socket => {
  username = socket.handshake.session.name;
  sessionId = socket.handshake.session.uid;
  socket.username = username;
};

const createSocketDetailArr = socket => {
  getSocketDetailByUsername(socket.username, res => {
    if (res === false) {
      socketDetailArr.push({
        sessionId: socket.handshake.session.uid,
        socket: socket,
        socketId: socket.id,
        name: socket.username
      });
      console.log(
        "no socket object found in this name :" + socketDetailArr.length
      );
    }
  });
};

const getSocketDetailByUsername = (username, cb) => {
  //console.log(sessionId);
  socketDetailArr.forEach(socketObj => {
    if (socketObj.name === username) {
      return cb(socketObj);
    }
  });
  return cb(false);
};

const setDefaultRoom = socket => {
  socket.room = defaultRoom;
};

const getGroups = socket => {
  //console.log(socket.username);
  getUserGroups.get(socket.username, (err, groupArr) => {
    if (err) console.log(err);
    else {
      //console.log(groupArr);
      socket.emit("renderRooms", groupArr);
    }
  });
};

const switchUserGroup = socket => {
  socket.on("loadRoomContent", group => {
    socket.leave(socket.room);
    socket.join(group);
    socket.room = group;
    groupContent.get(group, (err, content) => {
      if (err) console.log(err);
      else {
        socket.emit("clearConversationDom", socket.room);
        content.forEach(obj => {
          obj = obj.replace(/\"/g, "");
          messageContent.get(obj, (err, messageData) => {
            if (err) console.log("err retrieving conversation :" + err);
            else socket.emit("renderRoomContent", messageData);
          });
        });
      }
    });
  });
};

const saveUserChat = socket => {
  socket.on("saveText", data => {
    io.in(socket.room).emit("renderRoomContent", {
      username: socket.username,
      data: data
    });
    messageContent.save(socket.room, socket.username, data, (err, res) => {
      if (err) console.log("error saving user text :" + err);
    });
  });
};

const createGroup = socket => {
  socket.on("addGroup", (groupName, user) => {
    checkIfUserValid(user, res => {
      if (res === true) {
        GroupAdmins.save(groupName, socket.username, (err, res) => {
          if (err) console.log("error creating group :" + err);
          else {
            getUserGroups.save(socket.username, groupName, (err, res) => {
              if (err) console.log("err saving room to adder");
            });
            getUserGroups.save(user, groupName, (err, res) => {
              if (err) console.log("err saving room to added");
              //displayRoomsAfterAdding(socket, groupName, user);
            });
            getUsersFromGroup.save(`${groupName}:users`, user, socket.username);
            showNewGroupToAddedMembers(groupName);
          }
        });
      } else {
        getGroups(socket);
      }
    });
  });
};

const checkIfUserValid = (user, cb) => {
  User.getByName(user, (err, userDetails) => {
    if (!userDetails.id) {
      cb(false);
    } else cb(true);
  });
};

/*
const displayRoomsAfterAdding = socket => {
  getGroups(socket);
};
*/
const showNewGroupToAddedMembers = groupName => {
  getUsersFromGroup.get(`${groupName}:users`, (err, users) => {
    users.forEach(user => {
      getSocketDetailByUsername(user, socketObj => {
        if (socketObj) {
          getUserGroups.get(user, (err, groupArr) => {
            if (err) console.log(err);
            else {
              //console.log(groupArr);
              socketObj.socket.emit("renderRooms", groupArr);
            }
          });
        }
      });
    });
  });
};

const fetchUsersFromGroup = socket => {
  socket.on("getUsersInGroup", groupName => {
    //console.log(groupName);
    GroupAdmins.getAdminByGroupName(groupName, (err, admin) => {
      if (err) console.log("error retrieving the admin :" + err);
      else {
        let adminOfGroup = admin;
        getUsersFromGroup.get(`${groupName}:users`, (err, usersArr) => {
          if (err) console.log("error retrieving users from a group:" + err);
          else {
            if (socket.username === adminOfGroup) {
              adminViewOfUsers(socket, groupName, adminOfGroup, usersArr);
            } else normalUsersView(socket, groupName, adminOfGroup, usersArr);
          }
        });
      }
    });
  });
};

const adminViewOfUsers = (socket, groupName, admin, usersArr) => {
  socket.emit("adminsView", groupName, admin, usersArr);
};

const normalUsersView = (socket, groupName, admin, usersArr) => {
  socket.emit("usersView", groupName, admin, usersArr);
};

const deleteUser = socket => {
  socket.on("deleteUserFromGroup", user => {
    getUsersFromGroup.delete(`${socket.room}:users`, user);
    getUserGroups.delete(user, socket.room);
    getUsersFromGroup.get(`${socket.room}:users`, (err, userArr) => {
      GroupAdmins.getAdminByGroupName(`${socket.room}`, (err, admin) => {
        socket.emit("adminsView", socket.room, admin, userArr);
      });
    });
  });
};

const addNewUser = socket => {
  socket.on("addNewUserToGroup", user => {
    User.getByName(user, (err, userDetails) => {
      if (userDetails.id) {
        getUsersFromGroup.get(`${socket.room}:users`, (err, usersArr) => {
          if (usersArr.indexOf(user) === -1) {
            getUsersFromGroup.save(`${socket.room}:users`, user);
            getUserGroups.save(user, socket.room, (err, res) => {
              if (err) console.log("error saving new user :" + err);
            });
            getUsersFromGroup.get(`${socket.room}:users`, (err, userArr) => {
              GroupAdmins.getAdminByGroupName(
                `${socket.room}`,
                (err, admin) => {
                  socket.emit("adminsView", socket.room, admin, userArr);
                }
              );
            });
            getSocketDetailByUsername(user, socketObj => {
              if (socketObj) {
                getUserGroups.get(user, (err, groupArr) => {
                  if (err) console.log(err);
                  else {
                    //console.log(groupArr);
                    socketObj.socket.emit("renderRooms", groupArr);
                  }
                });
              }
            });
          }
        });
      }
    });
  });
};

const exitFromGroup = socket => {
  socket.on("exitGroup", groupName => {
    checkIfAdminExited(socket, groupName, res => {
      if (!res) {
        getUserGroups.delete(socket.username, groupName);
        getUsersFromGroup.delete(`${groupName}:users`, socket.username);
        getGroups(socket);
      } else {
        console.log(socket.username + " is the admin");
      }
    });
  });
};

const checkIfAdminExited = (socket, groupName, cb) => {
  GroupAdmins.getAdminByGroupName(groupName, (err, admin) => {
    if (err) console.log("err retrieving admin :" + err);
    else {
      if (socket.username === admin) cb(true);
      else cb(false);
    }
  });
};

const deleteGroup = socket => {
  socket.on("deleteGroupByAdmin", groupName => {
    getUsersFromGroup.get(`${groupName}:users`, (err, usersArr) => {
      if (err) console.log("err retrieving users from group :" + err);
      else {
        usersArr.forEach(user => {
          getUserGroups.delete(user, groupName);
        });
        getGroups(socket);
      }
    });
  });
};

const disconnect = socket => {
  socket.on("disconnect", () => {
    getIndexOfSocketObjByUsername(socket, index => {
      socketDetailArr.splice(index, 1);
    });
  });
};

const getIndexOfSocketObjByUsername = (socket, cb) => {
  socketDetailArr.forEach((socketObj, index) => {
    if (socketObj.name === socket.username) cb(index);
  });
};

http.listen(port, () => {
  console.log("listening on port :", port);
});
