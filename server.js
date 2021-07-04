const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const peers = {};

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
  }  = require('./utils/users')

app.use(require('cors')())
app.use(express.static(__dirname + '/public'));
  
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer);

const io = require('socket.io')(server)

app.set('view engine', 'ejs');

const { v4: uuidv4} = require('uuid');

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/video_call/', (req, res) => { 
    console.log("Entering main route!");
    res.redirect(`/video_call/${uuidv4()}`);
});

app.get('/video_call/:room', (req, res) => {
    res.render('room', {room_id: req.params.room});
}) 

app.get('/meeting_end', (req, res) =>  {
    res.render('end');
})

io.on('connection', socket => {
    socket.on('join-room', (room_id, user_id, username) => {
        // console.log( "Someone has joined the room!");
        socket.join(room_id);  
        const { error, user } = addUser({ id: user_id, name: username, room: room_id }); 

        socket.broadcast.to(room_id).emit('user-connected', user_id, username);
        const users_in_room =  getUsersInRoom(room_id) ;
        // console.log("inside server")
        // for(i in users_in_room)
        // console.log(users_in_room[i].name)

        io.to(room_id).emit('roomData', room = room_id, users = getUsersInRoom(room_id));

        socket.on('message', message => {
            io.to(room_id).emit('new_message', message, username) 
        })

        socket.on('disconnect', () => {
            console.log("Broadcasting close event!")
            socket.broadcast.to(room_id).emit('user-disconnected', user_id, username);
            const user = removeUser(user_id);
            io.to(room_id).emit('roomData', room = room_id, users = getUsersInRoom(room_id));
        })

        // socket.on('new_connection', (user_id, call) => {
        //     console.log("server new connection listen!!" + user_id + "  call :   "  + call)
        //     peers[user_id] = call;
        //     io.to(room_id).emit('updated_connections', peers);
        // })
    })
    
})


server.listen(process.env.PORT||3030); 