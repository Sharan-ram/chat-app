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
const Room = require("./models/room");
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
      //console.log("no socket object found in this name :" + socketDetailArr.length);
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
  getUserGroups.get(socket.username, (err, groupIdArr) => {
    if (err) console.log(err);
    else {
      //console.log(groupArr);
      socket.emit("clearRoomDiv", socket.room);
      groupIdArr.forEach(groupId => {
        groupId = groupId.replace(/\"/g, "");
        Room.getGroupNameById(groupId, (err, groupIdObj) => {
          socket.emit("renderRooms", groupIdObj);
        });
      });
    }
  });
};

const switchUserGroup = socket => {
  socket.on("loadRoomContent", (groupId, groupName) => {
    //console.log(groupId, groupName);
    socket.leave(socket.room);
    socket.join(`group:${groupId}`);
    socket.room = `group:${groupId}`;
    groupContent.get(`group:${groupId}`, (err, content) => {
      if (err) console.log(err);
      else {
        //console.log("socket room is :" + socket.room);
        Room.getGroupNameById(socket.room, (err, roomObj) => {
          socket.emit("clearConversationDom", roomObj);
          content.forEach(obj => {
            obj = obj.replace(/\"/g, "");
            messageContent.get(obj, (err, messageData) => {
              if (err) console.log("err retrieving conversation :" + err);
              else socket.emit("renderRoomContent", messageData);
            });
          });
        });
      }
    });
  });
};

const saveUserChat = socket => {
  socket.on("saveText", data => {
    if (data !== "" && socket.room !== "") {
      io.in(socket.room).emit("renderRoomContent", {
        username: socket.username,
        data: data
      });
      messageContent.save(socket.room, socket.username, data, (err, res) => {
        if (err) console.log("error saving user text :" + err);
      });
    }
  });
};

const createGroup = socket => {
  socket.on("addGroup", (groupName, user) => {
    checkIfUserValid(user, res => {
      if (res === true) {
        saveGroupAdmin(groupName, socket, user);
      } else {
        getGroups(socket);
      }
    });
  });
};

const saveGroupAdmin = (groupName, socket, user) => {
  GroupAdmins.save(groupName, socket.username, (err, res) => {
    if (err) console.log("error creating group :" + err);
    else {
      Room.save(groupName, (err, res) => {
        if (err) console.log("err saving group :" + err);
        else {
          saveGroupToAdder(groupName, socket);
          saveGroupToAddedUser(user, groupName, socket);
          saveNewUsersToGroupUsersArr(groupName, socket, user);
        }
      });
    }
  });
};

const saveGroupToAdder = (groupName, socket) => {
  Room.getCurrentId(id => {
    getUserGroups.save(socket.username, `group:${id}`, (err, res) => {
      if (err) console.log("err saving room to adder");
      else {
        //else console.log("group added to :" + socket.username);
        getGroups(socket);
      }
    });
  });
};

const saveGroupToAddedUser = (user, roomObj, socket) => {
  checkForRoomObj(roomObj, id => {
    getUserGroups.save(user, `group:${id}`, (err, res) => {
      if (err) console.log("err saving room to added");
      else {
        getSocketDetailByUsername(user, socketObj => {
          if (socketObj) {
            //console.log(socketObj.socket.username + " is also online");
            getGroups(socketObj.socket);
          }
        });
      }
    });
  });
};

const checkForRoomObj = (roomObj, cb) => {
  if (typeof roomObj === "string") {
    Room.getCurrentId(id => {
      cb(id);
    });
  } else {
    cb(roomObj.id);
  }
};

const saveNewUsersToGroupUsersArr = (groupName, socket, user) => {
  Room.getCurrentId(id => {
    //console.log(".............." + id);
    getUsersFromGroup.save(`group:${id}`, user, socket.username);
    //showNewGroupToAddedMembers(groupName, socket);
  });
};

const checkIfUserValid = (user, cb) => {
  User.getByName(user, (err, userDetails) => {
    if (!userDetails.id) {
      cb(false);
    } else cb(true);
  });
};

const fetchUsersFromGroup = socket => {
  socket.on("getUsersInGroup", roomObj => {
    //console.log("when group name is clicked,i get : " + roomObj.groupName);
    GroupAdmins.getAdminByGroupId(`group:${roomObj.id}`, (err, admin) => {
      //console.log("room admin is :" + admin);
      if (err) console.log("error retrieving the admin :" + err);
      else {
        let adminOfGroup = admin;
        getUsersFromGroup.get(`group:${roomObj.id}`, (err, usersArr) => {
          //console.log(usersArr);
          if (err) console.log("error retrieving users from a group:" + err);
          else {
            if (socket.username === adminOfGroup) {
              adminViewOfUsers(socket, roomObj, adminOfGroup, usersArr);
            } else normalUsersView(socket, roomObj, adminOfGroup, usersArr);
          }
        });
      }
    });
  });
};

const adminViewOfUsers = (socket, roomObj, admin, usersArr) => {
  socket.emit("adminsView", roomObj, admin, usersArr);
};

const normalUsersView = (socket, roomObj, admin, usersArr) => {
  socket.emit("usersView", roomObj, admin, usersArr);
};

const deleteUser = socket => {
  socket.on("deleteUserFromGroup", user => {
    //console.log(user, roomObj);
    getUsersFromGroup.delete(socket.room, user);
    getUserGroups.delete(user, socket.room);
    getUsersFromGroup.get(socket.room, (err, userArr) => {
      GroupAdmins.getAdminByGroupId(socket.room, (err, admin) => {
        Room.getGroupNameById(socket.room, (err, roomObj) => {
          socket.emit("adminsView", roomObj, admin, userArr);
        });
      });

      getSocketDetailByUsername(user, socketObj => {
        if (socketObj) {
          getGroups(socketObj.socket);
          if (socketObj.socket.room === socket.room) {
            socketObj.socket.emit("disableInput", user);
            socketObj.socket.leave(socket.room);
            socketObj.socket.join(defaultRoom);
          }
        }
      });
    });
    socket.emit("eventForDeletingUser", socket.room, user);
  });
};

const addNewUser = socket => {
  socket.on("addNewUserToGroup", (user, roomObj) => {
    User.getByName(user, (err, userDetails) => {
      if (userDetails.id) {
        getUsersFromGroup.get(`${socket.room}:users`, (err, usersArr) => {
          if (usersArr.indexOf(user) === -1) {
            getUsersFromGroup.save(socket.room, user);
            getUserGroups.save(user, socket.room);
            getSocketDetailByUsername(user, socketObj => {
              if (socketObj) {
                getGroups(socketObj.socket);
              }
            });
            GroupAdmins.getAdminByGroupId(socket.room, (err, admin) => {
              getUsersFromGroup.get(`${socket.room}`, (err, userArr) => {
                console.log(roomObj, admin, userArr);
                adminViewOfUsers(socket, roomObj, admin, userArr);
              });
            });
          }
        });
      }
    });
    socket.emit("eventForAddingUser", socket.room, user);
  });
};

const exitFromGroup = socket => {
  socket.on("exitGroup", groupName => {
    checkIfAdminExited(socket, groupName, res => {
      if (!res) {
        socket.emit("eventForExitingGroup", groupName, socket.username);
        getUserGroups.delete(socket.username, groupName);
        getUsersFromGroup.delete(`${groupName}:users`, socket.username);

        getGroups(socket);
        socket.emit("disableInput", socket.username);
        socket.leave(groupName);
        socket.join(defaultRoom);
      } else {
        console.log(socket.username + " is the admin");
      }
    });
  });
};

const checkIfAdminExited = (socket, groupName, cb) => {
  //console.log(groupName);
  GroupAdmins.getAdminByGroupId(groupName, (err, admin) => {
    if (err) console.log("err retrieving admin :" + err);
    else {
      //console.log("admin is " + admin);
      if (socket.username === admin) {
        //console.log(socket.username + " username ");
        GroupAdmins.changeAdmin(groupName, (err, usersArr) => {
          GroupAdmins.save(groupName, usersArr[0], (err, res) => {
            if (err) console.log(err);
            else console.log(res);
          });
        });
        socket.emit("eventForExitingGroup", groupName, socket.username);
        getUserGroups.delete(socket.username, groupName);
        getUsersFromGroup.delete(`${groupName}:users`, socket.username);
        getGroups(socket);
        socket.emit("disableInput", socket.username);
        socket.leave(groupName);
        socket.join(defaultRoom);
        cb(true);
      } else cb(false);
    }
  });
};

const deleteGroup = socket => {
  socket.on("deleteGroupByAdmin", str => {
    getUsersFromGroup.get(socket.room, (err, usersArr) => {
      if (err) console.log("err retrieving users from group :" + err);
      else {
        usersArr.forEach(user => {
          getUserGroups.delete(user, socket.room);
        });
        socket.emit("disableInput", usersArr);
        socket.emit("disableModal", socket.room);
        usersArr.forEach(user => {
          getSocketDetailByUsername(user, socketObj => {
            if (socketObj) {
              getGroups(socketObj.socket);
              if (socketObj.socket.room === socket.room) {
                socketObj.socket.emit("disableInput", user);
              }
              socketObj.socket.leave(socket.room);
            }
          });
        });
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
