const socket = io({ autoConnect: false });
const login = document.querySelector(".login");
const btn = document.querySelector(".login button");
const listOfMessages = document.querySelector("ul");

const initChat = () => {
    socket.connect();

    const username = document.querySelector(".login input").value;
    
    socket.emit("user_connected", username);

    socket.on("new_user_connected", (username) => {
        const li = document.createElement("li")
        li.innerText = username + " joined the room";
        listOfMessages.appendChild(li);
    });
};  

btn.addEventListener("click", initChat);