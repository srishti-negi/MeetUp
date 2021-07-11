let meeting_link = $('#meeting_link')
let room_link = $('#room_id')
let room_list = $('.list_teams')

room_list.empty();

// for (room in my_rooms) {
//     room_list.append(`<li><a href = "/chatroom/${my_rooms[room]}"> Room ${room}</li>`)
// }
var i = 0;
my_rooms.forEach(r => {
    room_list.append(`<li><a href = "/chatroom/${r}"> Team ${i}</li>`);
    i++;
})

function create_meeting() {
     if (confirm("Do you want to start a meeting?")) {
        window.open("/video_call")
    } 
}

function create_room() {
    if (confirm("Do you want to create a room?")) {
       window.open("/chatroom")
   } 
}

function confirm_room_join() {
    if (confirm("Do you want to join the room?")) {
        window.open(room_link.val())
    } 
}

function check_room_link_validity() {
    const room_str = room_link.val();
    const room_url_start = "https://gorgeous-great-basin-23038.herokuapp.com/chatroom/";
    const url_len = room_url_start.length;
    if (room_str.substr(0, url_len) == room_url_start) {
        confirm_room_join()
        }
    else {
        alert("Please enter valid Room Link")
    }
}

function confirm_meet_join() {
    if (confirm("Do you want to join the meeting?")) {
        console.log("redirecting to: " + meeting_link.val())
        window.open(meeting_link.val())
    } 
}

function check_link_validity() {
    const str = meeting_link.val();
    const url_start = "https://gorgeous-great-basin-23038.herokuapp.com/video_call/";
    const len = url_start.length;
    console.log(meeting_link.val());
    if (str.substr(0, len) == url_start) {
        confirm_meet_join()
        }
    else {
        alert("Please enter valid Meeting Link")
    }
}