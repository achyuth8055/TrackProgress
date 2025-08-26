const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: String,
  email: { type: String, unique: true },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
