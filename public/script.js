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
      socket.emit("typing", name)
  })

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", roomName, message);
    messageInput.value = "";
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

socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});

//typing
socket.on("typing-event", (name) => {
    const messageElement = document.createElement("div"); //skapa en div
    messageElement.setAttribute('id', 'typing') //ge diven id:et "typing"
    messageElement.innerText = `${name} is typing...`; //sätt div:ens innehåll till "Namn is typing..."
    messageContainer.append(messageElement); //lägg till diven i messageContainer
    timeout = setTimeout(resetTyping, 2500); //ropa på funktionen som tar bort diven efter 2,5 sekunder
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

//lista på inloggade i chatten
/* socket.on("updated-user-list", (usernames) => {
    console.log(usernames);
}) */