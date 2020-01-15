const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const serverSchema = new Schema(
  {
    name: {
      type: String
    },
    game: {
      type: String
    },
    status: {
      type: String
    },
    ip: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = serverSchema;
