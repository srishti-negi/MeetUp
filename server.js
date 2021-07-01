// the application will use express framework
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const peers = {}

app.use(require('cors')())
app.use(express.static(__dirname + '/public'));
  
//peerjs
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer);


const io = require('socket.io')(server)

// set EJS as view engine
app.set('view engine', 'ejs');

//import version 4 of uuid library
const { v4: uuidv4} = require('uuid');

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/video_call/', (req, res) => { 
    console.log("Entering main route!");
    //res.status(200).send("Hello World!");
    //res.render('room');
    //going to this route will redirect you to a newly generated uuid
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
        console.log( "Someone has joined the room!");
        socket.join(room_id);  
        socket.broadcast.to(room_id).emit('user-connected', user_id);

        socket.on('message', message => {
            io.to(room_id).emit('new_message', message, username) 
        })

        socket.on('disconnect', () => {
            console.log("Broadcassting close event!")
            socket.broadcast.to(room_id).emit('user-disconnected', user_id, username);
        })
    })
    
})



//listening into port 3030
server.listen(process.env.PORT||3030); 