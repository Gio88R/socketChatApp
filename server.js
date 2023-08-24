const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const rooms = {};
//test
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
  socket.on("new-user", (room, name) => {
    socket.join(room);
    displayRoomInfo();
    if (!rooms[room]) {
      rooms[room] = { users: {} };
    }

    rooms[room].users[socket.id] = name;
    io.to(room).emit("user-connected", name);
  });

  socket.on("send-chat-message", (room, message) => {
    io.to(room).emit("chat-message", {
      message: message,
      name: rooms[room].users[socket.id],
    });
  });

  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket
        .to(room)
        .broadcast.emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}

function displayRoomInfo() {
  const rooms = io.sockets.adapter.rooms;
  console.log("Room information:");
  console.log(io.sockets.adapter.rooms);
  rooms.forEach((sockets, room) => {
    console.log(
      `Room ${room} has sockets: ${JSON.stringify(Array.from(sockets))}`
    );
  });
  console.log("---");
}
