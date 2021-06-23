// const { text } = require("express");

// Javascript for front-end
let my_video_stream;
console.log("script has entered the chat")
const socket = io('/');
const peers = {};

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
    
});

var getUserMedia =
navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia;

console.log("socket: " + socket);

const my_video = document.createElement('video');
my_video.muted = true;

const video_grid = document.getElementById('video-grid');
console.log(video_grid);

navigator.mediaDevices.getUserMedia({
    // access audio-video feature
    video: true, 
    audio: true
}).then(stream => {
    my_video_stream = stream;
    console.log("user1")
    console.log(stream)
    addVideoStream(my_video, stream);

    console.log("user2b");
    console.log(stream)

    peer.on('call', call => {
        call.answer(stream);
        console.log("user2b")
        const video = document.createElement('video');
        call.on('stream', user_video_stream => {
            console.log("user2b")
            addVideoStream(video, user_video_stream);
        })
    })

    // socket.on('user-connected', (user_id) => {
    //     console.log("user connected, userid: " + user_id);
    //     connect_to_new_user(user_id, stream);
    // })

    socket.on('user-connected', userId => {
        // user is joining
        setTimeout(() => {
          // user joined
          connect_to_new_user(userId, stream)
        }, 1000)
      })

    socket.on('user-disconnected', userId => {
        console.log("bye peer: " + peer);
        if (peers[userId])
          peers[userId].close()
      })

    let chat_input = $('input')
    console.log(chat_input)
      
    //enter key = 13
    $('html').keydown((key_pressed) => {
      
        if(key_pressed.which == 13 && chat_input.val().length > 0) {
            socket.emit('message', chat_input.val());
            console.log(chat_input.val());
            chat_input.val("");
        }
    })
      
    socket.on('new_message', message => {
        console.log("message recieved from server " + message)
        $('ul').append(`<li class = "messages"><b>user  </b> <br>${message} </li><br>`)
        bottom_scroll();
    })
      
})

console.log("script.js: " + room_id);

peer.on('open', id => {
    console.log("Peer id: " + id);
    socket.emit('join-room', room_id, id);
}) 

const connect_to_new_user = (user_id, stream) => {
    const call = peer.call(user_id, stream);
    const video = document.createElement('video');
    call.on('stream', user_video_stream => {
        addVideoStream(video, user_video_stream);
    })
    // call.on('close', () => {
    //   console.log('video removed')
    //   video.remove()
    // })
    peer[user_id] = call;
    console.log("new peer: " + peer);
    console.log("new user is here :)");
}

//take video object and play the stream
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    }) 
    console.log("video appended" + video);
    video_grid.append(video); 
}


// let chat_input = $('input')
// console.log(chat_input)

// //enter key = 13
// $('html').keydown((key_pressed) => {

//     if(key_pressed.which == 13 && chat_input.val().length > 0) {
//         socket.emit('message', chat_input.val());
//         console.log(chat_input.val());
//         chat_input.val("");
//     }
// })

// socket.on('new_message', message => {
//     console.log("message recieved from server " + message)
//     $('ul').append(`<li class = "messages"><b>user  </b>${message} </li>`)
// })

const bottom_scroll = () => {
    var window_componenet = $('chat_window');
    window_componenet.scrollTop(window_componenet.prop("scroll_height"));
}

const toggle_mic = () => {
    const mic_status = my_video_stream.getAudioTracks()[0].enabled;
    if(mic_status) {
        my_video_stream.getAudioTracks()[0].enabled = false;
        set_unmute();
    }
    else {
        set_mute();
        my_video_stream.getAudioTracks()[0].enabled = true;
    }
}

const set_mute = () => {
    const html = `<i class="fa fa-microphone"></i>
    <span>Mute</span>`
    document.querySelector('.mute_button').innerHTML = html;
}

const set_unmute = () => {
    const html = `<i class="fa fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.mute_button').innerHTML = html;
}

const toggle_camera = () => {
    const camera_status = my_video_stream.getVideoTracks()[0].enabled;
    if(camera_status) {
        my_video_stream.getVideoTracks()[0].enabled = false;
        set_camera_close();
    }
    else {
        set_camera_open();
        my_video_stream.getVideoTracks()[0].enabled = true;
    }
}

const set_camera_close = () => {
    const html = `<i class="fa fa-stop"></i>
    <span>video On</span>`
    document.querySelector('.camera_button').innerHTML = html;
}

const set_camera_open = () => {
    const html = `<i class="fa fa-camera"></i>
    <span>video off</span>`
    document.querySelector('.camera_button').innerHTML = html;
}