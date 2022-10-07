/** @format */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
});

server.listen(PORT, () => {
  console.log("Sever up and Running at " + PORT);
});
