/** @format */

// const express = require("express");
// const http = require("http");
// const path = require("path");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const axios = require("axios");
// const Redis = require("redis");
// const cors = require("cors");
// const { Server } = require("socket.io");

import express from "express";
import http from "http";
import * as path from "path";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import Redis from "Redis";
import cors from "cors";
import { Server } from "socket.io";

// const ACTIONS = require("./Actions");
// const codeHistoryRoute = require("./routes/CodeHistory").default;
// const codeRunRoute = require("./routes/CodeRun").default;

import ACTIONS from "./Actions.js";
import codeHistoryRoute from "./routes/CodeHistory.js";
import codeRunRoute from "./routes/CodeRun.js";

const app = express();
const server = http.createServer(app);

import * as dotenv from "dotenv";
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origins: ["*"],
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

//Routes
app.use("/codehistory", codeHistoryRoute);
app.use("/code", codeRunRoute);

if (process.env.NODE_ENV == "production") {
  app.use(express.static("./client/build"));
  app.get("*", (req, res) => {
    const dirname = path.resolve(path.dirname(""));
    res.sendFile(path.resolve(dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

//DB
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection established");
  });

const client = Redis.createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URI}:${process.env.REDIS_PORT}`,
});

client.on("connect", () => console.log("Redis connected"));
client.on("error", (err) => console.log("Redis Connection Error", err));
client.connect();
const userSocketMap = {};

// client.setEx("name", 100, "varun");
// client.lPush("co", "vivek");
// client.expire("co", 100);

// const hi = async () => {
//   const data = await client.get("name");
//   console.log(data);
//   console.log(await client.ttl("co"));
// };
// hi();
// setTimeout(async () => {
//   console.log(await client.ttl("co"));
// }, 3000);

// function getAllConnectedClients(roomId) {
//   // Map
//   return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
//     (socketId) => {
//       return {
//         socketId,
//         userName: userSocketMap[socketId],
//       };
//     }
//   );
// }

const getAllRedisClints = async (roomId) => {
  const clients = await client.lRange(roomId, 0, -1);
  const data = [];
  clients.map((c) => data.push(JSON.parse(c)));
  data.map((d) => {
    userSocketMap[d.socketId] = d.userName;
  });
  return data;
};

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on(ACTIONS.JOIN, async ({ roomId, userName }) => {
    // userSocketMap[socket.id] = userName;
    const data = {
      socketId: socket.id,
      userName,
    };
    if (client.exists(roomId)) {
      client.lPush(roomId, JSON.stringify(data));
    } else {
      client.lPush(roomId, JSON.stringify(data));
      client.expire(roomId, 36000);
    }
    socket.join(roomId);
    // const clients = getAllConnectedClients(roomId);

    const clients = await getAllRedisClints(roomId);

    clients?.map(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        userName,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ code, socketId }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    console.log(rooms);

    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      });

      const data = {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      };

      client.LREM(roomId, 1, JSON.stringify(data));
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

server.listen(PORT, () => {
  console.log("Sever up and Running at " + PORT);
  //   const sourcecode = `cout<<"ki";`;
  // let resultPromise = cpp.runSource(sourcecode);
  // resultPromise
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
});
