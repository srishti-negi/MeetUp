// including necessary packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session');
const methodOverride = require('method-override')

const app = express();
const server = require('http').Server(app);

// including variables set in .env file
require('dotenv').config();

//connecting to MongoDB cloud via URI string defined in the .env file
mongoose.connect(process.env.dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then((res) => {console.log("Database connected!");})
    .catch((err) => {console.log("error connecting to db" + err)})

//including methods to dynamically access the data of users ina particular meeting room
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
  }  = require('./utils/users')

// including database models
const User = require('./models/user')
const Chat = require('./models/chat')
const Chatroom = require('./models/chatroom')

//including passport configurations set for user authentication
const passport_config = require('./config_auth/passport-config')
passport_config(passport);

app.use(require('cors')())
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use(flash())
app.use(session( {
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))
app.use(methodOverride('_method'))
app.use(passport.initialize());
app.use(passport.session());

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer);

// accessing server API of socket.io
const io = require('socket.io')(server)

// setting view engine as express
app.set('view engine', 'ejs');

const { v4: uuidv4} = require('uuid');

// Login route and login post methods
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureFlash: true,
    failureRedirect: '/login'
}))

// User logout method
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

// User registeration route and registeration post method
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register');
})

app.post('/register',async (req, res) => {
    try {
        //encrypt user password using bcrypt before storing it in a database
        const encrypted_pwd = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: encrypted_pwd,
        })

        // Check if user with same email id already a\exists in the database.
        const result = await User.findOne({email: req.body.email}).select("email").lean();
        if(result) {
            console.log("user exists!")
            res.redirect('/register')
        }
        else {
            console.log("user does not exist!")
            user.save()
                    .then((result) => {
                        res.redirect('/login');
                    })
                    .catch((err) => {
                        console.log(err);
            })
        }
    }
    catch {
        res.redirect('/register')
    }
})


app.get('/', checkAuthenticated, async (req, res) => {
    const name = req.user.username;
    // access the list of teams the user is a part of from the database and send it to the index.ejs page to be rendered
    const result = await User.findOne({email: req.user.email}).select("chatroom_id").lean();
    console.log(result)
    var my_rooms = []
    if(result)
        my_rooms = result.chatroom_id;
    else
        my_rooms = [""]
    console.log(my_rooms)
    res.render('index', {name: name, rooms: my_rooms});
})

// Common team chatroom route
app.get('/chatroom/', (req, res) => { 
    console.log("Entering room route!");
    res.redirect(`/chatroom/${uuidv4()}`);
});

app.get('/chatroom/:room', checkAuthenticated, async (req, res) => {
    // get the prebious chat in the chatroom and send it to the ejs file to be displayed
    const previous_chat = await Chat.aggregate([{
          $match: {
            chatroom_id: req.params.room
          }
        },
      ]);
    res.render('chatroom2', {room_id: req.params.room, name: req.user.username, email: req.user.email, chat_history: previous_chat});
}) 

//video call route
app.get('/video_call/', (req, res) => { 
    console.log("Entering main route!");
    res.redirect(`/video_call/${uuidv4()}`);
});

app.get('/video_call/:room', checkAuthenticated, (req, res) => {
    res.render('room', {room_id: req.params.room, name: req.user.username});
}) 

// meeting end route
app.get('/meeting_end', (req, res) =>  {
    res.render('end');
})

// listen for connection to socket
io.on('connection', socket => {
    // listen for join-room and send the updated room data to all other peers in the room in case a new peer joins in
    socket.on('join-room', async (room_id, user_id, username) => {
        socket.join(room_id);  
        const { error, user } = addUser({ id: user_id, name: username, room: room_id }); 

        socket.broadcast.to(room_id).emit('user-connected', user_id, username);
        const users_in_room =  getUsersInRoom(room_id) ;

        //send data of all the peers in the room to the meeting participants in order to dynamically  display the list of participants present in the meeting
        io.to(room_id).emit('roomData', room = room_id, users = getUsersInRoom(room_id));

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + "/" + mm + "/" + yyyy;
        
        // create new chat entry to be stored in database
        const new_chat = new Chat(
            {   date_chat_id: "Meeting" + today + room_id,
                chatroom_id: room_id,
                chat_in_meeting: true,
                content: ""
            }
        )

        // check if the meeting room is associated with a team, 
        // Store chat ONLY if the meeting room is a part of a team
        Chat.findOne({ date_chat_id: "Meeting" + today + room_id}, function(err, chat){
            if(err) {
              console.log(err);
            }
            var message;
            if(chat) {
                message = "chat exists";
                console.log(message)
            } else {
                message= "chat doesn't exist";
                console.log(message)
                new_chat.save()
                .then((result) => {
                    console.log("chat saved ")
                })
                .catch((err) => {
                    console.log(err);
        })
            }
        })

        // Listen for message from one of the peers in the room 
        // Store that message in the database(If the room is a team meeting room)
        // broadcast that message to all the other memebers present in the room
        socket.on('message', async (message, curr_time) => {
            const html_li = `<li class = "blockquote blockquote-primary message"><span class = "message_info"><b> ${username} </b> &emsp; ${curr_time}</span><br>${message} </li>`
            const result = await Chat.findOne({date_chat_id: "Meeting" + today + room_id}).select("_id").lean();
            if (result){
                Chat.updateOne({date_chat_id: "Meeting" + today + room_id},  { $addToSet: {content: html_li }}, function(err, result) {
                    if (err){
                    console.log(err);
                    }
                    else{
                    console.log("chat updated!");
                    }
                });
            }
            io.to(room_id).emit('new_message', message, username) 
        })

        // In case a peer is disconnected, update and resend the roomdata to all the peers present in the room
        socket.on('disconnect', () => {
            console.log("Broadcasting close event!")
            socket.broadcast.to(room_id).emit('user-disconnected', user_id, username);
            const user = removeUser(user_id);
            io.to(room_id).emit('roomData', room = room_id, users = getUsersInRoom(room_id));
        })
    })

    // Check if a new user has created or joined a chatroom
    // Update the chatroom database accordingly
    socket.on('join-chatroom', async (room_id, username, email) => {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + "/" + mm + "/" + yyyy;

        const result = await Chatroom.findOne({chatroom_id: room_id}).select("chatroom_id").lean();
        if(result) {
            Chatroom.updateOne({chatroom_id: room_id},  { $addToSet: {user_emails: email }}, function(err, result) {
                if (err){
                  console.log(err);
                }
                else{
                  console.log("Chatroom users updated");
                }
            });
        }
        else {
            const new_room = new Chatroom(
                {
                    chatroom_id: room_id,
                    user_emails: [email] 
                }
            )
            new_room.save();
        }

        const new_chat = new Chat(
            {   date_chat_id: today + room_id,
                chatroom_id: room_id,
                chat_in_meeting: false,
                content: ""
            }
        )

        Chat.findOne({ date_chat_id: today + room_id}, function(err, chat){
            if(err) {
              console.log(err);
            }
            var message;
            if(chat) {
                message = "chat exists";
                console.log(message)
            } else {
                message= "chat doesn't exist";
                console.log(message)
                new_chat.save()
                .then((result) => {
                    console.log("chat saved ")
                })
                .catch((err) => {
                    console.log(err);
        })
            }
        })
        
        // update user details to add chatroom in the list of rooms asociated with the user in the dayabase
        User.updateOne({email: email},  { $addToSet: {chatroom_id: room_id }}, function(err, result) {
            if (err){
              console.log(err);
            }
            else{
              console.log("User chatrooms updateOne: " + email + room_id);
            }
        });

        socket.join(room_id);  
        
        // Listen for a message sent from within a chatroom
        // Broadcast that message to other members in the chatroom
        socket.on('chat_only_message', (message, curr_time) => {
            const html_li = `<li class = "text-white mb-3 message"><span class = "message_info"><b> ${username} </b> &emsp; ${curr_time}</span><br>${message} </li>`
            Chat.updateOne({date_chat_id: today + room_id},  { $addToSet: {content: html_li }}, function(err, result) {
                if (err)
                {
                  console.log(err);
          
                }
                else{
                  console.log("chat updated!");
                }
            });
            io.to(room_id).emit('new_chat_only_message', message, username) 
        })
    })
})

// Check if the user is authentiated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }

// Check if the user is not authenticated
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

// set port for server to listen to
server.listen(process.env.PORT||3030); 