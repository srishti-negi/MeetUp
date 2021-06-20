var apiObj = null;

function make_room_id(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function StartMeeting(){
    const domain = 'meet.jit.si';
    const options = {
        roomName:  make_room_id(22),
        width: "100%",
        height: "100%",
        parentNode: document.querySelector('#jitsi-meet-conf-container'),
        configOverwrite:{
        },
        interfaceConfigOverwrite: {
            // DISPLAY_WELCOME_PAGE_CONTENT: false,
            // TOOLBAR_BUTTONS: [
            //     'microphone', 'camera' ],
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        },
    };
    apiObj = new JitsiMeetExternalAPI(domain, options);
}