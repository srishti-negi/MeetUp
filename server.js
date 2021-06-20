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
    res.render('index');
});

app.get('/video_call', (req, res) => {
    res.render('jitsi_meet');
}) 

app.get('/my_video', (req, res) => {
    res.render('room');
}) 

//listening into port 3030
server.listen(3030); 

  