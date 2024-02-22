const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },  // Reference to User model
  receiver: { type: Schema.Types.ObjectId, ref: 'User' },  // Reference to User model
  content: String,
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

module.exports = mongoose.model("message", messageSchema);