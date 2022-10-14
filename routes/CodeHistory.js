/** @format */

import express from "express";
const codeHistoryRoute = express.Router();

// const CodeHistory = require("../models/CodeHistory");

import CodeHistory from "../models/CodeHistory.js";

codeHistoryRoute.patch("/push", async (req, res) => {
  const newCode = new CodeHistory(req.body);
  const roomId = newCode.roomId;
  try {
    const iscode = await CodeHistory.findOne({ roomId });
    if (iscode) {
      const saveCode = await CodeHistory.findOneAndUpdate(
        { roomId: newCode.roomId },
        { $set: { code: newCode.code } },
        { new: true }
      );
      return res.status(201).send({ saveCode });
    }
    const savedCode = await newCode.save();
    return res.status(200).send(savedCode);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error);
  }
});

codeHistoryRoute.get("/:roomId", async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const code = await CodeHistory.findOne({ roomId: roomId });

    if (!code) {
      return res.status(200).json({ code: "" });
    }
    return res.status(200).send(code);
  } catch (error) {
    return res.status(404).send(error);
  }
});

// module.exports = routes;
export default codeHistoryRoute;
