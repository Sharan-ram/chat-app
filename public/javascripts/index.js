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

socket.on("clearRoomDiv", room => {
  document.getElementById("room-div").innerHTML = "";
});

socket.on("renderRooms", obj => {
  document.getElementById("getGroupName").innerHTML = "groupName";

  let templ =
    `<a class = "button is-light is-fullwidth"><h2 class="has-text-left" ><b>` +
    obj.groupName +
    `</b></h2></a>`;
  let divnode = document.createElement("div");
  divnode.setAttribute("id", "rooms");

  divnode.innerHTML = templ;
  document.getElementById("room-div").appendChild(divnode);
  divnode.onclick = () => {
    switchRoom(obj.id, obj.groupName);
  };
});

const switchRoom = (groupId, groupName) => {
  inputElement.disabled = false;
  inputElement.classList.remove("input-disabled");
  socket.emit("loadRoomContent", groupId, groupName);
};

socket.on("adminsView", (roomObj, admin, usersArr) => {
  viewForAdmin(roomObj, admin, usersArr);
});

socket.on("usersView", (roomObj, admin, usersArr) => {
  viewForUser(roomObj, admin, usersArr);
});

const viewForAdmin = (roomObj, admin, usersArr) => {
  //console.log(roomObj.id + " inside viewForAdmin");
  //console.log(admin);
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
        `<b>${user}</b><a class = "delete is-small" onclick = "crossClicked(\`` +
        user +
        `\`)"></a><br/>`;
    } else {
      userContent.innerHTML += `<b>${user}-Admin</b><br/>`;
    }
    /*let cross = document.getElementById("cross");
    cross.onclick = () => {
      console.log("cross clicked");
      crossClicked(user, roomObj);
    };*/
  });

  exitGroupButtonDiv.innerHTML =
    `<a class = "button is-dark" id="exitGroupButton" onclick = "exitGroupButtonClicked(\`` +
    roomObj +
    `\`)">Exit group</a>`;
  deleteGroupButtonDiv.innerHTML = `<a class = "button is-danger" id="deleteGroupButton" onclick = "deleteGroupButtonClicked()">Delete Group</a>`;
  addUserButtonDivForAdmin.innerHTML = `<a class = "button is-primary" id="addUserButtonForAdmin">Add User</a>`;
  addUserButtonForAdmin.onclick = () => {
    addUserButtonClicked(roomObj);
  };
};

const viewForUser = (roomObj, admin, usersArr) => {
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
    roomObj +
    `\`)">Exit group</a>`;
};

const deleteGroupButtonClicked = () => {
  //console.log(roomObj.id);
  socket.emit("deleteGroupByAdmin", "delete");
};

const exitGroupButtonClicked = roomObj => {
  socket.emit("exitGroup", roomObj);
};

const crossClicked = user => {
  console.log(user);
  //console.log(user);
  //console.log(user, roomObj);
  socket.emit("deleteUserFromGroup", user);
};

const addUserButtonClicked = roomObj => {
  userContent.innerHTML = `
    <input class = "input" type = "text" id = "userToBeAdded" placeholder = "enter username..">
      <a class = "button -is-primary" id = "addButton">Add</a>
  `;
  let addButton = document.getElementById("addButton");
  addButton.onclick = () => {
    addButtonClicked(roomObj);
  };
};

const addButtonClicked = roomObj => {
  let userToBeAddedDom = document.getElementById("userToBeAdded");
  userToBeAdded = userToBeAddedDom.value;
  socket.emit("addNewUserToGroup", userToBeAdded, roomObj);
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

socket.on("clearConversationDom", roomObj => {
  //console.log("roomObj inside conversation dom " + roomObj);
  document.getElementById("textMessages").innerHTML = "";
  let getGroupName = document.getElementById("getGroupName");
  getGroupName.innerHTML = roomObj.groupName;
  let displayGroupName = document.getElementById("displayGroupName");
  displayGroupName.onclick = () => {
    getClickedGroupName(roomObj);
  };
  //groupName.onclick = getClickedGroupName(roomObj);
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

/*
let displayGroupName = document.getElementById('displayGroupName');
displayGroupName.onclick = () => {
  let getGroupName = document.getElementById('getGroupName').innerHTML;
}
*/

const getClickedGroupName = roomObj => {
  //let getGroupName = document.getElementById("getGroupName").innerHTML;
  socket.emit("getUsersInGroup", roomObj);
};

socket.on("disableModal", room => {
  document.getElementById("modal").classList.remove("is-active");
});
