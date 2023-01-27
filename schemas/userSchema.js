const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscribed_to: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  ],
});

module.exports = userSchema;
