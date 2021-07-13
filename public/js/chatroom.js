const socket = io('/');
socket.emit('join-chatroom', room_id, username, email);
var user_list = [];

// get the message entered by the user in the input box
let chat_input = $('#message_ip')
  
$('html').keydown((key_pressed) => {
    if(key_pressed.which == 13 && chat_input.val().length > 0) {
        var d = new Date();
        var curr_time =  d.toLocaleTimeString();
        // send that message to the server do that the server can send it to other users in the chatroom
        socket.emit('chat_only_message', chat_input.val(), curr_time);
        chat_input.val("");
    }
})

const get_message_input = () => {
    // send message and current time to the server
    if(chat_input.val().length > 0) {
        var d = new Date();
        var curr_time =  d.toLocaleTimeString();
        socket.emit('chat_only_message', chat_input.val(), curr_time);
        chat_input.val("");
    }
}
  
socket.on('new_chat_only_message', (message , username)=> {
    // in case the server sends a message then display that message in the DOM
    var d = new Date();
    var curr_time =  d.toLocaleTimeString();
    $('.messages').append(`<li class = "text-white mb-3 message"><span class = "message_info"><b> ${username} </b> &emsp; ${curr_time}</span><br>${message} </li>`)
})      