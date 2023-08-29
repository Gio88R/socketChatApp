const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//deklarerar inför typing-functionen
var typing = false;
var timeout = undefined;

const rooms = {};
//const usernames = {};

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
    //usernames[name] = name
    displayRoomInfo();
    if (!rooms[room]) {
      rooms[room] = { users: {} };
    }
    //namn plockas upp och skickar med att en användare kopplas upp och samtidigt läggs i en lista av användare. 
    //men... uppkopplingen ska vara synlig för alla andra och namn på listan ska synas för alla... Hur lösa?
    //måste ske på "new-user" och ska ske samtidigt som "user-connected"
    rooms[room].users[socket.id] = name;
    socket.to(room).emit("user-connected", name);
  });

  socket.on("send-chat-message", (room, message) => {
    socket.to(room).emit("chat-message", {
      message: message,
      name: rooms[room].users[socket.id],
    });
  });

  //typing...
  //https://stackoverflow.com/questions/16766488/socket-io-how-to-check-if-user-is-typing-and-broadcast-it-to-other-users
  socket.on("typing", (room, name) => {
    if(typing == false) {
      typing = true;
      socket.to(room).emit("typing-event", name);
      timeout = setTimeout(timeoutFunction, 1500);
    };
});

  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket.to(room).emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });

  socket.on("leave-room", (roomName) => {
    console.log(`${socket.id} left room ${roomName}`);
    console.log(io.sockets.adapter.rooms);
    socket.leave(roomName);
  });
});

//timeout-funktion till typing...
function timeoutFunction () {
  typing = false;
}

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
