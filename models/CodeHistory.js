/** @format */

// const mongoose = require("mongoose");
import mongoose from "mongoose";

const codehistory = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  code: {
    type: String,
  },
  language: {
    type: String,
    required: true,
    default: "javaScript",
  },
});

const CodeHistory = mongoose.model("CodeHistory", codehistory);

export default CodeHistory;
