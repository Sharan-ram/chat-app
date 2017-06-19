const socket = io();
const name = document.getElementById("name").innerHTML;
socket.emit("addUser", name);

socket.on("renderRooms", roomArr => {
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

socket.on("clearDom", current_room => {
  document.getElementById("conversation").innerHTML = "";
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
