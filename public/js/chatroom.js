const socket = io('/');
socket.emit('join-chatroom', room_id, username, email);

update_users_list();
var user_list = [];

let chat_input = $('#message_ip')
  
$('html').keydown((key_pressed) => {
    if(key_pressed.which == 13 && chat_input.val().length > 0) {
        socket.emit('chat_only_message', chat_input.val());
        chat_input.val("");
    }
})

const get_message_input = () => {
    if(chat_input.val().length > 0) {
        socket.emit('chat_only_message', chat_input.val());
        chat_input.val("");
    }
}
  
socket.on('new_chat_only_message', (message , username)=> {
    var d = new Date();
    var curr_time =  d.toLocaleTimeString();
    $('.messages').append(`<li class = "text-white mb-3 message"><span class = "message_info"><b> ${username} </b> &emsp; ${curr_time}</span><br>${message} </li>`)
})      

socket.on('roomData', (room, users) => {
    user_list = users
    update_users_list();
})

function update_users_list() {
    let users = $('.users');
    var num_users = 0;
    users.empty();
    for(i in user_list) {
        users.append("<li>" + user_list[i].name + "</li>");
        num_users++;
    }
    let user_heading = $('#participants_heading')
    user_heading.empty();
    var num_str = num_users.toString();
    var new_heading = "<h3>Participants: " + num_str + "</h3>";
    console.log("new heading: " + new_heading)
    user_heading.append(new_heading)
}