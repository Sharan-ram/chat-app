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
        `\`)"></a>`;
    } else {
      userContent.innerHTML += `<b>` + user + ` -Admin</b><br/>`;
    }
  });
};

const viewForUser = (groupName, admin, usersArr) => {
  document.getElementById("modal").className += " is-active";
  let userContent = document.getElementById("userContent");
  userContent.innerHTML = "";
  userContent.classList.remove("displayFalse");
  userContent.className += " displayTrue";
  usersArr.forEach(user => {
    if (user !== admin) {
      userContent.innerHTML += `<b>` + user + `</b>`;
    } else {
      userContent.innerHTML += `<b>` + user + ` -Admin</b><br/>`;
    }
  });
};
const crossClicked = user => {
  socket.emit("deleteUserFromGroup", user);
};

const addUserButtonClicked = () => {};

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
