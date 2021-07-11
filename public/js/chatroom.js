const socket = io('/');
socket.emit('join-chatroom', room_id, username, email);

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