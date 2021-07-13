const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// set schema foe chatroom database
const ChatroomSchema = new Schema({
    chatroom_id: {
        type: String,
        required: true,
    },

    name: {
        type: String
    },

    user_emails: {
        type: [String]
    }
}, {timestamps: true});

const Chatroom = mongoose.model('chatroom', ChatroomSchema)
module.exports = Chatroom;