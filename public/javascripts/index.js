let deleteGroupButtonDiv = document.getElementById("delete");
let addUserButtonDivForAdmin = document.getElementById(
  "addUserButtonDivForAdmin"
);
let exitGroupButtonDiv = document.getElementById("exit");
let userContent = document.getElementById("userContent");
let inputElement = document.getElementById("data");

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
  document.getElementById("getGroupName").innerHTML = "groupName";
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
  inputElement.disabled = false;
  inputElement.classList.remove("input-disabled");
  socket.emit("loadRoomContent", current_room);
};

const getClickedGroupName = () => {
  let groupName = document.getElementById("getGroupName").innerHTML;
  //console.log("am i getting the group name");
  socket.emit("getUsersInGroup", groupName);
};

socket.on("adminsView", (groupName, admin, usersArr) => {
  viewForAdmin(groupName, admin, usersArr);
});

socket.on("usersView", (groupName, admin, usersArr) => {
  viewForUser(groupName, admin, usersArr);
});

const viewForAdmin = (groupName, admin, usersArr) => {
  deleteGroupButtonDiv.innerHTML = "";
  exitGroupButtonDiv.innerHTML = "";
  addUserButtonDivForAdmin.innerHTML = "";
  document.getElementById("modal").className += " is-active";
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
        `\`,\`` +
        groupName +
        `\`)"></a><br/>`;
    } else {
      userContent.innerHTML += `<b>` + user + ` -Admin</b><br/>`;
    }
  });
  exitGroupButtonDiv.innerHTML =
    `<a class = "button is-dark" id="exitGroupButton" onclick = "exitGroupButtonClicked(\`` +
    groupName +
    `\`)">Exit group</a>`;
  deleteGroupButtonDiv.innerHTML =
    `<a class = "button is-danger" id="deleteGroupButton" onclick = "deleteGroupButtonClicked(\`` +
    groupName +
    `\`)">Delete Group</a>`;
  addUserButtonDivForAdmin.innerHTML = `<a class = "button is-primary" id="addUserButtonForAdmin" onclick = "addUserButtonClicked()">Add User</a>`;
};

const viewForUser = (groupName, admin, usersArr) => {
  addUserButtonDivForAdmin.innerHTML = "";
  deleteGroupButtonDiv.innerHTML = "";
  exitGroupButtonDiv.innerHTML = "";
  document.getElementById("modal").className += " is-active";
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

const crossClicked = (user, groupName) => {
  socket.emit("deleteUserFromGroup", user, groupName);
};

const addUserButtonClicked = () => {
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
  if (
    obj.data.endsWith("is added to the group") === false &&
    obj.data.endsWith("was removed from the group") === false &&
    obj.data.endsWith("left the group") === false
  ) {
    normalText(obj);
  } else if (obj.data.endsWith("is added to the group") === true) {
    userAddition(obj);
  } else if (obj.data.endsWith("was removed from the group") === true) {
    userDeletion(obj);
  } else {
    userExit(obj);
  }
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

const normalText = obj => {
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
};

const userAddition = obj => {
  let templ = `
        <p>${obj.data}</p>
    `;
  let divNode = document.createElement("div");
  divNode.className = "content";
  divNode.setAttribute("id", "addUserTexts");
  divNode.innerHTML = templ;
  document.getElementById("textMessages").appendChild(divNode);
};

const userDeletion = obj => {
  let templ = `
        <p>${obj.data}</p>
    `;
  let divNode = document.createElement("div");
  divNode.className = "content";
  divNode.setAttribute("id", "deleteUserTexts");
  divNode.innerHTML = templ;
  document.getElementById("textMessages").appendChild(divNode);
};

const userExit = obj => {
  let templ = `
        <p>${obj.data}</p>
    `;
  let divNode = document.createElement("div");
  divNode.className = "content";
  divNode.setAttribute("id", "deleteUserTexts");
  divNode.innerHTML = templ;
  document.getElementById("textMessages").appendChild(divNode);
};

socket.on("disableInput", user => {
  inputElement.disabled = true;
  inputElement.className += " input-disabled";
});

socket.on("eventForAddingUser", (groupName, user) => {
  socket.emit("saveText", user + " is added to the group");
});

socket.on("eventForDeletingUser", (groupName, user) => {
  socket.emit("saveText", user + " was removed from the group");
});

socket.on("eventForExitingGroup", (groupName, user) => {
  document.getElementById("modal").classList.remove("is-active");
  socket.emit("saveText", user + " left the group");
});
