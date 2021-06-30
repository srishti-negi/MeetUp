let my_video_stream;
console.log("script has entered the chat")
const socket = io('/');
const peers = {};
// import { user_detail } from './user.js'

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443',
    config: {
        "iceServers": [
            {'urls': 'stun:stun.l.google.com:19302'}, 
            {'urls': 'stun:stun1.l.google.com:19302'},
            {'urls': 'stun:stun2.l.google.com:19302'},
            {'urls': 'stun:stun3.l.google.com:19302'},
            {'urls': 'stun:stun4.l.google.com:19302'}
        ]
    }
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
    video: true, 
    audio: true
}).then(stream => {
    err => console.log(err)
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

    socket.on('user-connected', (userId, username) => {
        // user is joining
        setTimeout(() => {
          // user joined
          connect_to_new_user(userId, stream)
        }, 4000)
      })

    // socket.on('user-disconnected', userId => {
    //     console.log("heard a close event broadcast")
    //     if (peers[userId]) {
    //         peers[userId].close()
    //         console.log("Closing connection")
    //     }
    //   })

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
      
    socket.on('new_message', (message , username)=> {
        console.log("message recieved from server " + message)
        $('ul').append(`<li class = "messages"><b> ${username} </b> <br>${message} </li><br>`)
        bottom_scroll();
    })
      
})

socket.on('user-disconnected', userId => {
    setTimeout(() => {
        // user joined
        //what do you want to do?
        console.log("heard a close event broadcast" + peers[userId])
        if (peers[userId]) {
            peers[userId].close()
            console.log("Closing connection")
        }
      }, 1000)
})

console.log("script.js: " + room_id);

peer.on('open', id => {
    // var username = "user"
    // myPagePromise.then(() => {
    //      username = sessionStorage.getItem("username")
    //     console.log("script.js session storage: " + username)
    //   })
    var username = localStorage.getItem("username")
    // sessionStorage.clear();
    console.log("Peer id: " + id);
    console.log("sessionstorage val : " + username)
    socket.emit('join-room', room_id, id, username);
}) 

const connect_to_new_user = (user_id, stream) => {
    const call = peer.call(user_id, stream);
    const video = document.createElement('video');
    call.on('stream', user_video_stream => {
        addVideoStream(video, user_video_stream);
    })
    call.on('close', () => {
        video.remove()
    })
    peers[user_id] = call;
    console.log("new peer: " + peer);
    console.log("new user is here :)");
    console.log("peers[userid] " + peers[user_id])
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    }) 
    console.log("video appended" + video);
    video_grid.append(video); 
}

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


