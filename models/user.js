const mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

// User database schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: [true, "Email Exist"],
    },
    password: {
        type: String,
        required: true
    },
    chatroom_id: {
        type: [String],
    },
}, {timestamps: true});

UserSchema.plugin(passportLocalMongoose);  

const User = mongoose.model('user', UserSchema)
module.exports = User;