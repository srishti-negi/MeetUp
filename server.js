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

require('dotenv').config();

mongoose.connect(process.env.dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then((res) => {console.log("Database connected!");})
    .catch((err) => {console.log("error connecting to db" + err)})

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
  }  = require('./utils/users')

const User = require('./models/user')
const Chat = require('./models/chat')

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

const io = require('socket.io')(server)

app.set('view engine', 'ejs');

const { v4: uuidv4} = require('uuid');

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureFlash: true,
    failureRedirect: '/login'
}))

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register');
})

app.post('/register',async (req, res) => {
    try {
        const encrypted_pwd = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: encrypted_pwd,
        })
        console.log(user)
        User.findOne({email: req.query.email}, function(err, user){
            if(err) {
              console.log(err);
            }
            var message;
            if(user) {
              console.log(user)
                message = "user exists";
                console.log(message)
                res.redirect('/register')
            } else {
                message= "user doesn't exist";
                console.log(message)
            }
        })
        user.save()
                .then((result) => {
                    res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
        })
    }
    catch {
        res.redirect('/register')
    }
})


app.get('/', checkAuthenticated, (req, res) => {
    const name = req.user.username;
    res.render('index', {name: name});
})

app.get('/profile_page', checkAuthenticated, (req, res) => {
    res.render('profile_page', {name: req.user.username});
})

app.get('/my_chatrooms', checkAuthenticated, (req, res) => {
    res.render('my_chatrooms', {name: req.user.username, email: req.user.email})
})

app.get('/chatroom/:room', checkAuthenticated, async (req, res) => {
    const previous_chat = await Chat.aggregate([{
          $match: {
            chatroom_id: req.params.room
          }
        },
      ]);
    console.log(previous_chat);
    res.render('chatroom2', {room_id: req.params.room, name: req.user.username, email: req.user.email, chat_history: previous_chat});
}) 

app.get('/video_call/', (req, res) => { 
    console.log("Entering main route!");
    res.redirect(`/video_call/${uuidv4()}`);
});

app.get('/video_call/:room', checkAuthenticated, (req, res) => {
    res.render('room', {room_id: req.params.room, name: req.user.username});
}) 

app.get('/meeting_end', (req, res) =>  {
    res.render('end');
})

io.on('connection', socket => {
    socket.on('join-room', (room_id, user_id, username) => {
        
        socket.join(room_id);  
        const { error, user } = addUser({ id: user_id, name: username, room: room_id }); 

        socket.broadcast.to(room_id).emit('user-connected', user_id, username);
        const users_in_room =  getUsersInRoom(room_id) ;

        io.to(room_id).emit('roomData', room = room_id, users = getUsersInRoom(room_id));

        socket.on('message', message => {
            console.log("server just heard this message " + message);
            io.to(room_id).emit('new_message', message, username) 
        })

        socket.on('disconnect', () => {
            console.log("Broadcasting close event!")
            socket.broadcast.to(room_id).emit('user-disconnected', user_id, username);
            const user = removeUser(user_id);
            io.to(room_id).emit('roomData', room = room_id, users = getUsersInRoom(room_id));
        })
    })

    socket.on('join-chatroom', (room_id, username) => {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + "/" + mm + "/" + yyyy;

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
              console.log(chat)
                message = "chat exists";
                console.log(message)
            } else {
                message= "chat doesn't exist";
                console.log(message)
                new_chat.save()
                .then((result) => {
                    console.log("chat saved " + new_chat)
                })
                .catch((err) => {
                    console.log(err);
        })
            }
        })
        
        socket.join(room_id);  
        socket.on('chat_only_message', message => {
            var d = new Date();
            var curr_time =  d.toLocaleTimeString();
            const html_li = `<li class = "text-white mb-3 message"><span class = "message_info"><b> ${username} </b> &emsp; ${curr_time}</span><br>${message} </li>`
            Chat.updateOne({date_chat_id: today + room_id},  { $addToSet: {content: html_li }}, function(err, result) {
                if (err)
                {
                  console.log(err);
          
                }
                else{
                  console.log(result);
                }
            });
            io.to(room_id).emit('new_chat_only_message', message, username) 
        })
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

server.listen(process.env.PORT||3030); 