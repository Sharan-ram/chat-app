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

socket.on("adminsView", (groupName, admin, usersArr) => {
  viewForAdmin(groupName, admin, usersArr);
});

socket.on("usersView", (groupName, admin, usersArr) => {
  viewForUser(groupName, admin, usersArr);
});

const viewForAdmin = (groupName, admin, usersArr) => {
  let deleteGroupButtonDiv = document.getElementById("delete");
  deleteGroupButtonDiv.innerHTML = "";
  let exitGroupButtonDiv = document.getElementById("exit");
  exitGroupButtonDiv.innerHTML = "";
  let addUserButtonDivForAdmin = document.getElementById(
    "addUserButtonDivForAdmin"
  );
  addUserButtonDivForAdmin.innerHTML = "";
  document.getElementById("modal").className += " is-active";
  let userContent = document.getElementById("userContent");
  userContent.innerHTML = "";
  userContent.classList.remove("displayFalse");
  userContent.className += " displayTrue";
  usersArr.forEach(user => {
    if (user !== admin) {
      userContent.innerHTML +=
        `<b>` +
        user +
        `</b>` +
        `<a class = "delete is-small" onclick = "crossClicked(\`` +
        user +
        `\`)"></a><br/>`;
    } else {
      userContent.innerHTML += `<b>` + user + ` -Admin</b><br/>`;
    }
  });
  exitGroupButtonDiv.innerHTML = `<a class = "button is-dark" id="exitGroupButton" onclick = "exitGroupButtonClicked()">Exit group</a>`;
  deleteGroupButtonDiv.innerHTML =
    `<a class = "button is-danger" id="deleteGroupButton" onclick = "deleteGroupButtonClicked(\`` +
    groupName +
    `\`)">Delete Group</a>`;
  addUserButtonDivForAdmin.innerHTML = `<a class = "button is-primary" id="addUserButtonForAdmin" onclick = "addUserButtonClicked()">Add User</a>`;
};

const viewForUser = (groupName, admin, usersArr) => {
  let exitGroupButtonDiv = document.getElementById("exit");
  exitGroupButtonDiv.innerHTML = "";
  document.getElementById("modal").className += " is-active";
  let userContent = document.getElementById("userContent");
  userContent.innerHTML = "";
  userContent.classList.remove("displayFalse");
  userContent.className += " displayTrue";
  usersArr.forEach(user => {
    if (user !== admin) {
      userContent.innerHTML += `<b>` + user + `</b><br/>`;
    } else {
      userContent.innerHTML += `<b>` + user + ` -Admin</b><br/>`;
    }
  });
  exitGroupButtonDiv.innerHTML =
    `<a class = "button is-danger" id="exitGroupButton" onclick = "exitGroupButtonClicked(\`` +
    groupName +
    `\`)">Exit group</a>`;
};

const deleteGroupButtonClicked = groupName => {
  socket.emit("deleteGroupByAdmin", groupName);
};

const exitGroupButtonClicked = groupName => {
  socket.emit("exitGroup", groupName);
};

const crossClicked = user => {
  socket.emit("deleteUserFromGroup", user);
};

const addUserButtonClicked = () => {
  let userContent = document.getElementById("userContent");
  userContent.innerHTML = `
    <input class = "input" type = "text" id = "userToBeAdded" placeholder = "enter username..">
      <a class = "button -is-primary" id = "addButton" onclick = "addButtonClicked()">Add</a>
  `;
};

const addButtonClicked = () => {
  let userToBeAddedDom = document.getElementById("userToBeAdded");
  userToBeAdded = userToBeAddedDom.value;
  socket.emit("addNewUserToGroup", userToBeAdded);
};

const toggleModal = () => {
  document.getElementById("modal").classList.remove("is-active");
};

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

let sendButton = document.getElementById("send");
sendButton.onclick = () => {
  let dataElement = document.getElementById("data");
  let data = dataElement.value;
  dataElement.value = "";
  //console.log(socket.room, socket.username);
  socket.emit("saveText", data);
};

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
