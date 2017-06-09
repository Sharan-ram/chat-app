var socket = io();
socket.on("connect", function() {
  socket.emit("adduser", prompt("What's your name?"));
});

socket.on("updatechat", function(username, data) {
  $("#conversation").append("<b>" + username + ":</b> " + data + "<br>");
});

socket.on("updaterooms", function(rooms, current_room) {
  $("#rooms").empty();
  $.each(rooms, function(key, value) {
    if (value == current_room) {
      $("#rooms").append("<div>" + value + "</div>");
    } else {
      $("#rooms").append(
        '<div><a href="#" onclick="switchRoom(\'' +
          value +
          "')\">" +
          value +
          "</a></div>"
      );
    }
  });
});

function switchRoom(room) {
  socket.emit("switchRoom", room);
}

$(function() {
  $("#datasend").click(function() {
    var message = $("#data").val();
    $("#data").val("");

    socket.emit("sendchat", message);
  });
});
