// get the form data from the index.ejs file
let meeting_link = $('#meeting_link')
let room_link = $('#room_id')
let room_list = $('.list_teams')

room_list.empty();

// display the list of teams associated with the user
var i = 0;
my_rooms.forEach(r => {
    if(r.length > 0)
        room_list.append(`<li><a href = "/chatroom/${r}"> Team ${i}</li>`);
    i++;
})

// confirm and redirect user to new meeting
function create_meeting() {
     if (confirm("Do you want to start a meeting?")) {
        window.open("/video_call")
    } 
}

// confiem and redirect user to new team common room
function create_room() {
    if (confirm("Do you want to create a room?")) {
       window.open("/chatroom")
   } 
}

// confirm if user wants to join the room
function confirm_room_join() {
    if (confirm("Do you want to join the room?")) {
        window.open(room_link.val())
    } 
}

// check if the user has entered a valid team link
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

// confirm if user wants to join the meeting
function confirm_meet_join() {
    if (confirm("Do you want to join the meeting?")) {
        console.log("redirecting to: " + meeting_link.val())
        window.open(meeting_link.val())
    } 
}

// checke if the link entered leads to a valid meeting
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