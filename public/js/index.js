let meeting_link = $('#meeting_link')

console.log("meeting link: " + meeting_link)

var participant_name;
sessionStorage.clear()
function update_user_name() {
    participant_name =  $('#Username').val();
    console.log("Inside function: " + participant_name);
    localStorage.setItem("username", participant_name)
    // const myPagePromise = $.post({}, data => {
    //     sessionStorage.setItem("username", participant_name);
    //   }, "json");
    now_what()
}

function now_what() {
    console.log("Heheheh lets see....");
    console.log("drumroll " + sessionStorage.getItem("username"));
}

console.log("Outside func : " + sessionStorage.getItem("username"))

function create_meeting() {
    if($('#Username').val().trim() == null || $('#Username').val().trim() == "") {
        alert("Please enter your username");
    }
    else if (confirm("Do you want to start a meeting?")) {
        window.open("/video_call")
    } 
}

function confirm_meet_join() {
    if($('#Username').val().trim() == null || $('#Username').val().trim() == "") {
        alert("Please enter your username");
    }
    else if (confirm("Do you want to join the meeting?")) {
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