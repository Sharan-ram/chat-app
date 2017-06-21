const socket = io();
const name = document.getElementById("name").innerHTML;
socket.emit("addUser", name);

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

socket.on("clearUsersDom", users => {
  document.getElementById("users").innerHTML = "";
});

socket.on("displayUsers", users => {
  users.forEach(user => {
    let hnode = document.createElement("h3");
    hnode.innerHTML = user;
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

const switchRoom = current_room => {
  socket.emit("loadRoomContent", current_room);
};

socket.on("updateChat", room => {
  socket.emit("renderChatToEveryone", room);
});

let group = document.getElementById("createGroup");
group.onclick = () => {
  let roomDiv = document.getElementById("room-div");
  roomDiv.innerHTML =
    "<input type = 'text' name = 'groupName' placeholder = 'Group Name' id = 'groupName'>" +
    "<br/><br/>" +
    "<input type = 'text' name = 'username' placeholder='add user' id = 'admin'>" +
    "<br/><br/>" +
    "<input type = 'button' value = 'Create Group' id = 'createGroupButton'>";
  let createGroupButton = document.getElementById("createGroupButton");

  createGroupButton.onclick = () => {
    let groupName = document.getElementById("groupName").value;
    let admin = document.getElementById("admin").value;
    socket.emit("addGroup", groupName, admin);
  };
};
