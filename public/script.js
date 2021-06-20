// const { Socket } = require("socket.io");

// Javascript for front-end
// let my_video_stream;

// const socket = io('/');

// console.log("socket: " + socket);

// const my_video = document.createElement('video');
// my_video.muted = true;

// const video_grid = document.getElementById('video-grid');
// console.log(video_grid);

// navigator.mediaDevices.getUserMedia({
//     // access audio-video feature
//     video: true, 
//     audio: true
// }).then(stream => {
//     my_video_stream = stream;
//     addVideoStream(my_video, stream);
// })

// console.log("script.js: " + room_id);

// socket.emit('join-room', room_id);

// socket.on('user-connected', () => {
//     connect_to_new_user();
// })

// const connect_to_new_user = () => {
//     console.log("new user is here :)");
// }

// //take video object and play the stream
// const addVideoStream = (video, stream) => {
//     video.srcObject = stream;
//     video.addEventListener('loadedmetadata', () => {
//         video.play();
//     }) 
//     video_grid.append(video); 
// }
const domain = "meet.jit.si";

const options = {
    roomName: 'JitsiMeetAPIExample',
    width: 700,
    height: 700,
    parentNode: document.querySelector('#meet'),
    devices: {
        audioInput: '<deviceLabel>',
        audioOutput: '<deviceLabel>',
        videoInput: '<deviceLabel>'
    },
    configOverwrite: { startWithAudioMuted: true },
    interfaceConfigOverwrite: { DISABLE_DOMINANT_SPEAKER_INDICATOR: true },
    userInfo: {
        email: 'email@jitsiexamplemail.com',
        displayName: 'John Doe'
    }
};

const api = new JitsiMeetExternalAPI(domain, options);
