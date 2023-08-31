const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

var typing = false;
var timeout = undefined;

const rooms = {};
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/room", (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect("/");
  }

  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);
  io.emit("room-created", req.body.room);
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/");
  }
  res.sendFile(__dirname + "/public/room.html");
});

server.listen(3000);

io.on("connection", (socket) => {
  socket.emit("roomList", Object.keys(rooms));
  socket.on("request-room-list", () => {
    socket.emit("roomList", Object.keys(rooms));
  });
  socket.on("new-user", (room, name) => {
    socket.join(room);
    console.log(`Sockets in ${room}:`);
    console.log(Array.from(io.sockets.adapter.rooms.get(room)));
    if (!rooms[room]) {
      rooms[room] = { users: {} };
    }

    rooms[room].users[socket.id] = name;
    socket.to(room).emit("user-connected", name);
  });

  socket.on("send-chat-message", (room, message) => {
    socket.to(room).emit("chat-message", {
      message: message,
      name: rooms[room].users[socket.id],
    });
  });

  socket.on("typing", (room, name) => {
    if (typing == false) {
      typing = true;
      socket.to(room).emit("typing-event", name);
      timeout = setTimeout(timeoutFunction, 1500);
    }
  });

  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket.to(room).emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
  socket.on("leave-room", (roomName) => {
    console.log(`${socket.id} left room ${roomName}`);
    socket.leave(roomName);
    console.log(`Sockets in ${roomName}:`);
    console.log(Array.from(io.sockets.adapter.rooms.get(roomName) || []));
    const socketsInRoom = Array.from(
      io.sockets.adapter.rooms.get(roomName) || []
    );
    if (socketsInRoom.length === 0) {
      delete rooms[roomName];
      console.log(`Removed room ${roomName} from rooms.`);
    }
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}

function timeoutFunction() {
  typing = false;
}
