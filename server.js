const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const usernames = {}

//on vill ha två argument, eventmanet och en funktion
io.on("connection", (socket) => {

    //LOGIN
    console.log("New user connected: ", socket.id);

    socket.on("send_username_to_server", (username) => {
        //console.log(data);
        usernames[socket.id] = username;
        socket.broadcast.emit("send_username_to_all", username);
    });

    //disconnecta om man stänger ner rutan
    socket.on("disconnect", () => {
        console.log("A user disconnected");
        //skicka ut att den har disconnected
        socket.broadcast.emit('user_disconnected', usernames[socket.id]);
        //ta bort från objektet
        delete usernames[socket.id];
    });

    //ROOMS
    socket.on("join_room", (room) => {
        socket.join(room);
        const roomList = convertMapOfSetsToObjectOfArrays(io.sockets.adapter.rooms);
        io.emit("list_of_rooms", roomList);
        console.log(roomList);
      });

    //CHATT
    socket.on('send-chat-message', message => {
        console.log(message)
        io.emit('chat-message', { message: message, username: usernames[socket.id] });
    });
});

//ROOMS
function convertMapOfSetsToObjectOfArrays(mapOfSets) {
    const objectOfArrays = {};
  
    for (const [key, set] of mapOfSets) {
      objectOfArrays[key] = Array.from(set);
    }
  
    return objectOfArrays;
  }
  

server.listen(3000, () => console.log("Server is up and running"));