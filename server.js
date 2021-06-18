// the application will use express framework
const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(require('cors')())


const io = require('socket.io')(server)


// set public url for script files
app.use(express.static('public'));

// set EJS as view engine
app.set('view engine', 'ejs');

//import version 4 of uuid library
const { v4: uuidv4} = require('uuid');

app.get('/', (req, res) => { 
    console.log("Entering main route!");
    //res.status(200).send("Hello World!");
    //res.render('room');
    //going to this route will redirect you to a newly generated uuid
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', {room_id: req.params.room});
}) 

io.on('connection', socket => {
    socket.on('join-room', (roomId) => {
        console.log("Someone has joined the room!");
        socket.join(roomId);  
        // socket.to(roomId).broadcast.emit('user-connected');
        // socket.broadcast.to(roomid).emit('user-connected');
        socket.broadcast.to(roomId).emit('user-connected');

    })
})

//listening into port 3030
server.listen(3030); 

  