const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    chatroom_id: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    time_sent: {
        type: String,
        required: true
    }
}, {timestamps: true});

const Message = mongoose.model('message', MessageSchema)
module.exports = Message;