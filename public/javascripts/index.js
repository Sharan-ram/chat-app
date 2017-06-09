var socket = io();

socket.emit("adduser", prompt("What's your name?"));

socket.on("updatechat", function(username, data) {
  let boldNode = document.createElement("b");
  let hNode = document.createElement("h3");
  hNode.setAttribute("class", "username");
  let hNodeText = document.createTextNode(username + ":");
  hNode.appendChild(hNodeText);
  boldNode.appendChild(hNode);

  let pNode = document.createElement("p");
  let pNodeText = document.createTextNode(data);
  pNode.appendChild(pNodeText);

  document
    .getElementById("conversation")
    .appendChild(boldNode)
    .appendChild(pNode);
});

socket.on("updaterooms", function(rooms, current_room) {
  let roomNode = document.getElementById("rooms");
  roomNode.innerHTML = "";
  rooms.forEach(room => {
    if (room === current_room) {
      let hNode = document.createElement("h3");
      let hNodeText = document.createTextNode(room);
      hNode.appendChild(hNodeText);

      document.getElementById("rooms").appendChild(hNode);
    } else {
      let hNode = document.createElement("h3");
      let aNode = document.createElement("a");
      aNode.setAttribute("href", "#");
      let aNodeText = document.createTextNode(room);
      aNode.appendChild(aNodeText);
      hNode.appendChild(aNode);
      document.getElementById("rooms").appendChild(hNode);
      let localroom = room;
      aNode.onclick = () => {
        switchRoom(localroom);
      };
    }
  });
});
function switchRoom(room) {
  console.log(room);
  socket.emit("switchRoom", room);
}

let datasend = document.getElementById("datasend");
datasend.onclick = () => {
  let data = document.getElementById("data");
  let message = data.value;
  data.value = "";
  socket.emit("sendchat", message);
};
