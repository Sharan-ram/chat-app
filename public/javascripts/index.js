var socket = io();
var button = document.getElementById("send");
button.onclick = () => {
  let message = document.getElementById("typing-box");
  socket.emit("chat message", message.value);
  message.value = "";
  return false;
};
