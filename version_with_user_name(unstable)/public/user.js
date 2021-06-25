var participant_name;

function update_user_name() {
    participant_name =  $('#Username').val();
    console.log("Inside function: " + participant_name);
    sessionStorage.setItem("username", participant_name)
}

function now_what() {
    console.log("Heheheh lets see....");
    console.log("drumroll " + sessionStorage.getItem("user_name"));
}

console.log("Outside func : " + sessionStorage.getItem("user_name"))


// export const user_detail = participant_name