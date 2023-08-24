const socket = io({ autoConnect: false });

//LOGIN
const login = document.querySelector(".login")
const btn = document.querySelector(".login button")
const listOftMessages = document.querySelector(".login ul")

//ROOMS
// 1. skapar en variable som är kopplad till din knapp
// 2. skapar du en event listener för en knapp 
const createChatRoom = document.querySelector(".chatroom button")
const listOfRooms = document.querySelector(".chatroom ul")

//CHATT
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const messageContainer = document.getElementById('message-container')

//const name = prompt('What is your name?')
//appendMessage('You joined');
const initChat = () => {
    //console.log("Starta Chatt");
    socket.connect();

    //LOGIN
    const username = document.querySelector(".login input").value;
    //skicka eventet till servern, var noga att döpa till något så du vet vad som sker
    //emit tar två argument, det första eventnamnet döper vi själva.andra event skickar vi med datan vi vill (sträng, usernamne, vad som)
    socket.emit("send_username_to_server", username);
    socket.on("new_user_connected", (username) => {
        const li = document.createElement("li")
        li.innerText = username + " joined the room";
        listOfMessages.appendChild(li);
    });

    socket.on("send_username_to_all", (username) => {
        const li = document.createElement("li");
        li.innerText = username + " joined the chat";
        listOftMessages.appendChild(li);
    });

    //ROOMS 
    socket.on("list_of_rooms", (rooms) => {
        const li = document.createElement("li");
        li.innerText = rooms;
        listOfRooms.appendChild(li);
        console.log(data);
    });

    //CHATT
    socket.on('chat-message', (data) => {
        appendMessage(`${data.username}: ${data.message}`);
    });

    //ta bort användare och meddela
    socket.on('user_disconnected', (username) => {
        const li = document.createElement("li");
        li.innerText = username + " left the chat";
        listOftMessages.appendChild(li);
    });
};

//LOGIN
btn.addEventListener("click", initChat);

//ROOMS
createChatRoom.addEventListener("click", () => {
    const roomname = document.querySelector(".chatroom input").value;
    socket.emit("join_room", roomname);
});
  
//CHATT
messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

function appendMessage(message) {
    const messageElement = document.createElement( 'div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
};