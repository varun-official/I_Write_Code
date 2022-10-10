/** @format */

const express = require("express");
const routes = express.Router();

const CodeHistory = require("../models/CodeHistory");

routes.post("/push", async (req, res) => {
  const newCode = new CodeHistory(req.body);
  //   console.log(newCode);
  try {
    const saveCode = await newCode.save();
    return res.status(201).send(saveCode);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error);
  }
});

routes.get("/:roomId", async (req, res) => {
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

module.exports = routes;
