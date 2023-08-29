const socket = io("http://localhost:3000");
const messageContainer = document.getElementById("message-container");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

const roomName = window.location.pathname.slice(1); // Extract room name from the URL

var timeout = undefined;

if (messageForm != null) {
  const name = prompt("What is your name?");
  appendMessage("You joined");
  socket.emit("new-user", roomName, name);
  
  //typing
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

//typing
socket.on("typing-event", (name) => {
    const messageElement = document.createElement("div"); //skapa en div
    messageElement.setAttribute('id', 'typing') //ge diven id:et "typing"
    messageElement.innerText = `${name} is typing...`; //sätt div:ens innehåll till "Namn is typing..."
    messageContainer.append(messageElement); //lägg till diven i messageContainer
    timeout = setTimeout(resetTyping, 1500); //ropa på funktionen som tar bort diven efter 1,5 sekunder
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

//typing...-funktion
function resetTyping() {
    const typingMessage = document.getElementById("typing"); //hitta ett element som har id:et "typing"
    typingMessage.remove(); //ta bort elementet
}

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}
