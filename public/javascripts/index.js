const socket = io();
const name = document.getElementById("name").innerHTML;
localStorage.setItem("loggedIn", true);
// /document.getElementById("errorText").innerHTML = "";
setInterval(() => {
  if (localStorage.length === 0) {
    window.location.replace("/logout");
  }
}, 5000);
//console.log(localStorage.loggedIn);

const handleLogout = () => {
  //console.log(localStorage);
  window.localStorage.clear();
  window.location.replace("/logout");
};

socket.emit("onLogin", name);

socket.on("renderRooms", roomArr => {
  document.getElementById("room-div").innerHTML = "";
  roomArr.forEach(room => {
    let templ = "<h3>" + room + "</h3>";
    let anode = document.createElement("a");
    anode.setAttribute("href", "#");
    anode.innerHTML = templ;
    document.getElementById("room-div").appendChild(anode);
    anode.onclick = () => {
      switchRoom(room);
    };
  });
});

const switchRoom = current_room => {
  socket.emit("loadRoomContent", current_room);
};

socket.on("addNewUser", room => {
  let newUserDiv = document.getElementById("newUserDiv");
  newUserDiv.innerHTML = "";
  let anode = document.createElement("a");
  anode.setAttribute("href", "#");
  anode.innerHTML = "Add new user";
  newUserDiv.appendChild(anode);

  anode.onclick = () => {
    let usersDiv = document.getElementById("users");
    usersDiv.innerHTML =
      "<input type = 'text' name = 'newUserName' id='newUserId' placeholder = 'add new user'>" +
      "<br/><br/>" +
      "<input type = 'button' id = 'AddUserButton' value = 'Add user' >";
    let addUserButton = document.getElementById("AddUserButton");
    addUserButton.onclick = () => {
      let newUserName = document.getElementById("newUserId").value;
      socket.emit("saveNewUser", newUserName);
    };
  };
});

socket.on("renderRoomContent", obj => {
  //document.getElementById("conversation").innerHTML = "";
  let templ =
    "<h3 class='username'>" + obj.username + "</h3> <p>" + obj.data + "</p>";
  let divNode = document.createElement("div");
  divNode.innerHTML = templ;
  document.getElementById("conversation").appendChild(divNode);
});

socket.on("clearConversationDom", current_room => {
  document.getElementById("conversation").innerHTML = "";
});

/*
socket.on("clearUsersDom", users => {
  document.getElementById("users").innerHTML = "";
});
*/

socket.on("displayUsers", (users, admin) => {
  document.getElementById("users").innerHTML = "";
  users.forEach(user => {
    let hnode = document.createElement("h3");
    admin
      ? (hnode.innerHTML = user + "<a class = 'delete is-small'></a>")
      : (hnode.innerHTML = user);
    document.getElementById("users").appendChild(hnode);
  });
});

let sendButton = document.getElementById("datasend");
sendButton.onclick = () => {
  let dataElement = document.getElementById("data");
  let data = dataElement.value;
  dataElement.value = "";
  //console.log(socket.room, socket.username);
  socket.emit("saveText", data);
};

socket.on("updateChat", room => {
  socket.emit("renderChatToEveryone", room);
});

let group = document.getElementById("createGroup");
group.onclick = () => {
  let roomDiv = document.getElementById("room-div");
  roomDiv.innerHTML =
    "<h4 id = 'errorText'></h4>" +
    "<input type = 'text' name = 'groupName' placeholder = 'Group Name' id = 'groupName'>" +
    "<br/><br/>" +
    "<input type = 'text' name = 'username' placeholder='add user' id = 'admin'>" +
    "<br/><br/>" +
    "<input type = 'button' value = 'Create Group' id = 'createGroupButton'>";
  let createGroupButton = document.getElementById("createGroupButton");

  createGroupButton.onclick = () => {
    let groupName = document.getElementById("groupName").value;
    let user = document.getElementById("admin").value;
    socket.emit("addGroup", groupName, user);
  };
};
