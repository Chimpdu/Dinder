const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let userSchema = new Schema({
    username: { type: String },
    password: { type: String },
    nickname: { type: String},
    birthday: { type: Date},
    gender: { type: String},
    intro: { type: String },
    hobby: { type: String },
    description: { type: String },
    likes: [{ userId: String, username: String }],
    likedBy: [{ userId: String, username: String }],
});

module.exports = mongoose.model("user", userSchema);