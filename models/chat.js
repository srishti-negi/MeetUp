const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    date_chat_id: {
        type: String,
        unique: [true, "Room Exists!"],
        required: true,
    },

    chatroom_id: {
        type: String,
        required: true,
    },

    chat_in_meeting: {
        type: Boolean
    },
    content: {
        type: [String]
    }
}, {timestamps: true});

const Chat = mongoose.model('chat', ChatSchema)
module.exports = Chat;