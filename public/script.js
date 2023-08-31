const socket = io("http://localhost:3000");
const messageContainer = document.getElementById("message-container");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

const roomName = window.location.pathname.slice(1);

var timeout = undefined;

if (messageForm != null) {
  const name = prompt("What is your name?");
  appendMessage("You joined");
  socket.emit("new-user", roomName, name);

  messageInput.addEventListener("keypress", () => {
    socket.emit("typing", roomName, name);
  });

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;

    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", roomName, message);
    messageInput.value = "";
  });
  const disconnect = document.getElementById("disconnect");
  disconnect.addEventListener("click", () => {
    if (confirm(`Are you sure you want to leave room ${roomName}?`)) {
      socket.emit("leave-room", roomName);
      window.location.href = "/";
    }
  });
}

socket.on("room-created", (room) => {
  const roomElement = document.createElement("div");
  roomElement.innerText = room;
  const roomLink = document.createElement("a");
  roomLink.href = `/${room}`;
  roomLink.innerText = "Join Room";
  roomContainer.append(roomElement);
  roomElement.append(roomLink);
});

socket.on("typing-event", (name) => {
  const messageElement = document.createElement("div");
  messageElement.setAttribute("id", "typing");
  messageElement.innerText = `${name} is typing...`;
  messageContainer.append(messageElement);
  timeout = setTimeout(resetTyping, 1500);
});

socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  appendMessage(`${name} disconnected`);
});

function resetTyping() {
  const typingMessage = document.getElementById("typing");
  typingMessage.remove();
}

function appendMessage(message) {
  const messageElement = document.createElement("div");
  updateClock();
  function updateClock() {
    const date = new Date();
    let time = date.toLocaleTimeString();
    messageElement.innerText = time + " | " + message;
  }

  messageContainer.append(messageElement);
}

socket.on("connect", () => {
  socket.emit("request-room-list");
  console.log("---");
});
socket.on("roomList", (roomList) => {
  roomContainer.innerHTML = "";

  roomList.forEach((room) => {
    const roomElement = document.createElement("div");
    roomElement.id = `room-${room}`;

    const roomLink = document.createElement("a");
    roomLink.href = `/${room}`;
    roomLink.innerText = "Join Room";

    roomElement.innerText = room;
    roomElement.append(roomLink);

    roomContainer.append(roomElement);
  });
});
