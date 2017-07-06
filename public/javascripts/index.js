const socket = io();

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

let name = document.getElementById("name").innerHTML;

socket.on("renderRooms", roomArr => {
  document.getElementById("room-div").innerHTML = "";
  roomArr.forEach(room => {
    let templ =
      `<a class = "button is-light is-fullwidth"><h2 class="has-text-left" ><b>` +
      room +
      `</b></h2></a>`;
    let divnode = document.createElement("div");
    divnode.setAttribute("id", "rooms");

    divnode.innerHTML = templ;
    document.getElementById("room-div").appendChild(divnode);
    divnode.onclick = () => {
      switchRoom(room);
    };
  });
});

const switchRoom = current_room => {
  socket.emit("loadRoomContent", current_room);
};

const getClickedGroupName = () => {
  let groupName = document.getElementById("getGroupName").innerHTML;
  socket.emit("getUsersInGroup", groupName);
};

socket.on("adminsView", (groupName, admin, usersArr) => {});

socket.on("usersView", (groupName, admin, usersArr) => {});

/*socket.on("addNewUser", room => {
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
*/

socket.on("renderRoomContent", obj => {
  //document.getElementById("conversation").innerHTML = "";
  let templ =
    "<h3 class='username'><strong>" +
    obj.username +
    ":" +
    "</strong></h3> <p>" +
    obj.data +
    "</p>";
  let divNode = document.createElement("div");
  divNode.setAttribute("id", "texts");
  divNode.innerHTML = templ;
  document.getElementById("textMessages").appendChild(divNode);
});

socket.on("clearConversationDom", current_room => {
  document.getElementById("textMessages").innerHTML = "";
  document.getElementById("getGroupName").innerHTML = current_room;
});

/*
socket.on("clearUsersDom", users => {
  document.getElementById("users").innerHTML = "";
});
*/
/*socket.on("clearNewUserText", room => {
  document.getElementById("newUserDiv").innerHTML = "";
});
socket.on("displayUsers", (users, admin) => {
  document.getElementById("users").innerHTML = "";
  users.forEach(user => {
    let hnode = document.createElement("h3");
    admin
      ? (hnode.innerHTML =
          user +
          "<a class = 'delete is-small' id='cross' onclick = 'crossClicked(\"" +
          user +
          "\")'></a>")
      : (hnode.innerHTML = user);

    document.getElementById("users").appendChild(hnode);
  });
});
const crossClicked = user => {
  socket.emit("deleteUser", user);
};
*/
let sendButton = document.getElementById("send");
sendButton.onclick = () => {
  let dataElement = document.getElementById("data");
  let data = dataElement.value;
  dataElement.value = "";
  //console.log(socket.room, socket.username);
  socket.emit("saveText", data);
};

/*socket.on("updateChat", room => {
  socket.emit("renderChatToEveryone", room);
});
*/
let group = document.getElementById("createGroup");
group.onclick = () => {
  let roomDiv = document.getElementById("room-div");
  roomDiv.innerHTML = `
    <div class = "field">
      <p class = "control">
        <input class = "input" type = "text" placeholder = "group name" id = "groupName">
      </p>
      <p class = "control">
        <input class = "input" type = "text" placeholder = "username" id = "admin">
      </p>
      <p class = "control">
        <a class = "button is-primary" id = "createGroupButton">add group</a>
      </p>
    </div>
  `;
  let createGroupButton = document.getElementById("createGroupButton");

  createGroupButton.onclick = () => {
    let groupName = document.getElementById("groupName").value;
    let user = document.getElementById("admin").value;
    socket.emit("addGroup", groupName, user);
  };
};

