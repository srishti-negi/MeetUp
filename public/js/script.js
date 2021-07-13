let my_video_stream;

// maintain record of peers and the peers id associated with them
var peers = {};
// maintain a list of calls
var calls = []
const socket = io('/');
update_users_list();
// maintain a list of user in room
var user_list = [];

// get current data time as soon as the meeting is started
var start_d = new Date();
const meeting_start_time = start_d.getTime();

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443',
    config: { // set iceservers configuration by adding TURN servers
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

// create a video element in DOM
const my_video = document.createElement('video');
my_video.muted = true;

const meeting_videos = document.getElementById('video-grid');

navigator.mediaDevices.getUserMedia({
    video: true, 
    audio: true
}).then(stream => {
    err => console.log(err)
    my_video_stream = stream;
   
    // add client video stream to DOM
    addVideoStream(my_video, stream, peer.id);

    peer.on('call', call => {
        // answer calls from other peers
        console.log("promise call: " + peer.id)
        console.log("cal: " + call.peer)
        peers[call.peer] = call;
        calls.push(call)
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', user_video_stream => {
            addVideoStream(video, user_video_stream, call.peer);
        })
    })

    // connect with another peer
    socket.on('user-connected', (userId, username) => {
        setTimeout(() => {
          connect_to_new_user(userId, stream);
        }, 4000)
        
      })

    // get chat input from the meeting
    let chat_input = $('input')
      
    //enter key = 13
    $('html').keydown((key_pressed) => {
      
        if(key_pressed.which == 13 && chat_input.val().length > 0) {
            var d = new Date();
            var curr_time =  d.toLocaleTimeString();
            // send messgae and message time to server
            socket.emit('message', chat_input.val(), curr_time);
            chat_input.val("");
        }
    })
      
    // listen for new messages from the server and append them to the DOM dynamically
    socket.on('new_message', (message , username)=> {
        var d = new Date();
        var curr_time =  d.toLocaleTimeString();
        $('.messages').append(`<li class = "blockquote blockquote-primary message"><span class = "message_info"><b> ${username} </b> &emsp; ${curr_time}</span><br>${message} </li>`)
    })
      
})

// get data of other peers in room through the server
socket.on('roomData', (room, users) => {
    user_list = users
    update_users_list();
})

// If a user is disconnected
// get his video stream from the DPM by element ID associated by the user
// Close and destroy the video stream of the disconnected user
socket.on('user-disconnected', (userId, username) => {
    setTimeout(() => {
        console.log("heard a close event broadcast" + userId)
        console.log( "video html " + $(userId))
        var vid = document.getElementById(userId)
        vid.remove();
        if (peers[userId]) {
            peers[userId].close()
            console.log("Closing connection")
            update_users_list();
        }
      }, 2000)
})

// upon opening peer connection send the join-room event to the server and update the list of users present in the room
peer.on('open', id => {
    var username = my_user_name;
    update_users_list();
    socket.emit('join-room', room_id, id, username);
}) 

// connect new user to the room by creating video stream element from the dom and appending it to the DOM
const connect_to_new_user = (user_id, stream) => {
    console.log("connect_to_new_user: " + user_id)
    const call = peer.call(user_id, stream);
    const video = document.createElement('video');
    call.on('stream', user_video_stream => {
        addVideoStream(video, user_video_stream, user_id);
    })
    call.on('close', () => {
        console.log("call close event!!")
        video.remove()
    })
    peers[user_id] = call;
    console.log("new peer: " + peer);
    console.log("new user is here :)");
    console.log("peers[userid] " + peers[user_id])
    update_users_list();
}

// add video stream passed to this function to the DOM 
// associate the given id parammeter with the video
const addVideoStream = (video, stream, user_id) => {
    video.srcObject = stream;
    video.setAttribute("id", user_id)
    video.addEventListener('loadedmetadata', () => {
        video.play();
    }) 
    console.log("video appended" + video);
    meeting_videos.append(video); 
}

// toggle mic in the meeting by enabling/disabling the audio track
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
    const html = `<a class="nav-link active btn" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-microphone"></i> Mute
  </a>`
    document.querySelector('.mute_button').innerHTML = html;
}

const set_unmute = () => {
    const html = `<a class="nav-link active btn" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-microphone-slash"></i> Unmute
  </a>`
    document.querySelector('.mute_button').innerHTML = html;
}

// toggle the camera in the meeting by enabling/disabling the video track of the user
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
    const html = ` <a class="nav-link active btn" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-camera"></i> Video On
  </a>`
    document.querySelector('.camera_button').innerHTML = html;
}

const set_camera_open = () => {
    const html = ` <a class="nav-link active btn" data-toggle="tab" href="#link1" role="tablist">
    <i class="fa fa-camera"></i> Video Off
  </a>`
    document.querySelector('.camera_button').innerHTML = html;
}

// copy the currwnt url of the page and 
// alert the user that the meeting link has been copied to the clipboard
const copy_url = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Meeting link has been copied to clipboard!")
} 

// Dynamically update time in the meeting timer
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

// dynamically upadte and display the list of users present in the meetingroom
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