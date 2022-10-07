/** @format */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const ACTIONS = require('./Actions')

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const PORT = process.env.PORT || 5000;

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                userName: userSocketMap[socketId],
            };
        }
    );
}

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on(ACTIONS.JOIN,({roomId,userName})=>{
    userSocketMap[socket.id]=userName;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);

    clients.forEach(({socketId})=>{
        io.to(socketId).emit(ACTIONS.JOINED,{
            clients,
            userName,
            socketId: socket.id,
        })
    })
  })
});

server.listen(PORT, () => {
  console.log("Sever up and Running at " + PORT);
});
