let my_video_stream;
console.log("script has entered the chat")
var peers = {};
var calls = []
const socket = io('/');
update_users_list();
var user_list = [];

var start_d = new Date();
const meeting_start_time = start_d.getTime();

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030',
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
// console.log(video_grid);

navigator.mediaDevices.getUserMedia({
    video: true, 
    audio: true
}).then(stream => {
    err => console.log(err)
    my_video_stream = stream;
   
    addVideoStream(my_video, stream, peer.id);

    peer.on('call', call => {
        console.log("promise call: " + peer.id)
        console.log("cal: " + call.peer)
        // for(i in call)
        //     console.log(i + " " + JSON.stringify(call[i]));
        calls.push(call)
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', user_video_stream => {
            addVideoStream(video, user_video_stream, call.peer);
        })
    })

    socket.on('user-connected', (userId, username) => {
        // user is joining
        setTimeout(() => {
          // user joined
          connect_to_new_user(userId, stream);
        }, 4000)
        
      })

    let chat_input = $('input')
    // console.log(chat_input)
      
    //enter key = 13
    $('html').keydown((key_pressed) => {
      
        if(key_pressed.which == 13 && chat_input.val().length > 0) {
            socket.emit('message', chat_input.val());
            // console.log(chat_input.val());
            chat_input.val("");
        }
    })
      
    socket.on('new_message', (message , username)=> {
        var d = new Date();
        var curr_time =  d.toLocaleTimeString();
        // console.log("message recieved from server at time: " + curr_time)
        $('.messages').append(`<li class = "blockquote blockquote-primary message"><span class = "message_info"><b> ${username} </b> &emsp; ${curr_time}</span><br>${message} </li>`)
        // bottom_scroll();
    })

    // socket.on('roomData', (room, users) => {
    //     console.log("### Listening to room data" + typeof users);
    //     // user_list.push(users);
    //     user_list = users
    //     console.log("work..." + typeof user_list);
    //     for(i in user_list)
    //         console.log("## server.js roomData : " + i +" : " + user_list[i].name);
    //     update_users_list();
    // })
      
})

socket.on('roomData', (room, users) => {
    console.log("### Listening to room data" + typeof users);
    // user_list.push(users);
    user_list = users
    // console.log("work..." + typeof user_list);
    // for(i in user_list)
        // console.log("## server.js roomData : " + i +" : " + user_list[i].name);
    update_users_list();
})

socket.on('user-disconnected', (userId, username) => {
    setTimeout(() => {
        console.log("heard a close event broadcast" + userId)
        console.log( "video html " + $(userId))
        // for(p in peer.connections)
        // console.log(p)
        // handlePeerDisconnect();
        var v_id = "#" + peer.id
        var vid = document.getElementById(userId)
        vid.remove();
        // if (peers[userId]) {
        //     peers[userId].close()
        //     console.log("Closing connection")
        //     update_users_list();
        // }
      }, 2000)
})

// console.log("script.js: " + room_id);

peer.on('open', id => {
    var username = localStorage.getItem("username")
    console.log("#open")
    console.log("Peer id: " + id);
    // my_video.setAttribute("id", id)
    update_users_list();
    console.log("sessionstorage val : " + username)
    socket.emit('join-room', room_id, id, username);
}) 

const connect_to_new_user = (user_id, stream) => {
    console.log("connect_to_new_user: " + user_id)
    const call = peer.call(user_id, stream);
    const video = document.createElement('video');
    call.on('stream', user_video_stream => {
        addVideoStream(video, user_video_stream, user_id);
    })
    call.on('close', () => {
        console.log("call close event!!")
        // handlePeerDisconnect();
        video.remove()
    })
    peers[user_id] = call;
    console.log("new peer: " + peer);
    console.log("new user is here :)");
    console.log("peers[userid] " + peers[user_id])
    update_users_list();
}

const addVideoStream = (video, stream, user_id) => {
    video.srcObject = stream;
    video.setAttribute("id", user_id)
    video.setAttribute("class", user_id)
    video.addEventListener('loadedmetadata', () => {
        video.play();
    }) 
    console.log("video appended" + video);
    video_grid.append(video); 
}

const bottom_scroll = () => {
    console.log("scroll chat to bottom!!")
    var chat_window = $('chat_window');
    console.log("scrolling elemnent " + chat_window);
    chat_window.scrollBottom = chat_window.scrollHeight;
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
    // const html = `<i class="fa fa-microphone"></i>
    // <span>Mute</span>`
    const html = `<a class="nav-link active" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-microphone"></i> Mute
  </a>`
    document.querySelector('.mute_button').innerHTML = html;
}

const set_unmute = () => {
    // const html = `<i class="fa fa-microphone-slash"></i>
    // <span>Unmute</span>`
    const html = `<a class="nav-link active" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-microphone-slash"></i> Unmute
  </a>`
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
    const html = ` <a class="nav-link active" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-camera"></i> Video On
  </a>`
    document.querySelector('.camera_button').innerHTML = html;
}

const set_camera_open = () => {
    const html = ` <a class="nav-link active" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-camera"></i> Video Off
  </a>`
    document.querySelector('.camera_button').innerHTML = html;
}

const copy_url = () => {
    navigator.clipboard.writeText(window.location.href);
    // console.log("invite link copied");
    alert("Meeting link has been copied to clipboard!")
    const alert_on_copy = `<div class="alert alert-primary alert-with-icon">
    <button type="button" aria-hidden="true" class="close" data-dismiss="alert" aria-label="Close">
      <i class="tim-icons icon-simple-remove"></i>
    </button>
    <span data-notify="icon" class="tim-icons icon-coins"></span>
    <span>
    Invite Link Copied to Clipboard</span>
  </div>`
//   document.querySelector('#invite_alert').innerHTML = alert_on_copy;
} 

var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds = 0;
setInterval(setTime, 1000);

function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function update_users_list() {
    let users = $('.users');
    var num_users = 0;
    users.empty();
    for(i in user_list) {
        users.append("<li class =" + user_list[i].id  + " >" + user_list[i].name + "</li>");
        num_users++;
    }
    let user_heading = $('#participants_heading')
    user_heading.empty();
    var num_str = num_users.toString();
    var new_heading = "<h3>Participants: " + num_str + "</h3>";
    console.log("new heading: " + new_heading)
    user_heading.append(new_heading)
}