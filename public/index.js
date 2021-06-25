let meeting_link = $('input')
console.log("meeting link: " + meeting_link)

function confirm_meet_join() {
    var txt;
    if (confirm("Press a button!")) {
        window.open(document.getElementById("meeting_link").href)
    } 
    document.getElementById("demo").innerHTML = txt;
}



$('html').keydown((key_pressed) => {
      
    if(key_pressed.which == 13 && meeting_link.val().length > 0) {
        // socket.emit('message', meeting_link.val());
        const str = meeting_link.val();
        const url_start = "http://localhost:3030/video_call/"
        const len = url_start.length();
        console.log(meeting_link.val());
        if (str.substr(0, len) == url_start) {
            // console.log('OK');
            document.getElementById("meeting_link").href = meeting_link.val();
            // console.log("href val " + document.getElementById("meeting_link").href)
            // console.log("input val " + meeting_link.val())
            confirm_meet_join()

        }
        else {
            alert("Please enter valid Meeting Link")
        }
        // meeting_link.val("");
    }
})