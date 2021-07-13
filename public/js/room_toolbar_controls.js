// expand the video display grid if the chat and participant button are toggled off
const expand_main_div = () => {
    var tool_bar = document.getElementById("toolbar");
    tool_bar.style.width = "100%";
    var left_part = document.getElementById("left_portion");
    left_part.style.width = "100%";
}

// contract the main div in case either the chat or the participants button is toggled on
const contract_main_div = () => {
    var tool_bar = document.getElementById("toolbar");
    tool_bar.style.width = "80%";
    var left_part = document.getElementById("left_portion");
    left_part.style.width = "80%";
}

// toggle the chat div
const toggle_chat = () => {
    var x = document.getElementById("chat");
    var users = document.getElementById("participants");
    if (x.style.display === "none") {
        if(users.style.display === "flex")
            users.style.display = "none"
        x.style.opacity = 1;
        x.style.display = "flex";
        contract_main_div();
    } else {
        x.style.opacity = 0;
        x.style.display = "none";
        expand_main_div();
    }
}

// toggle the participants list div
const toggle_user_list = () => {
    var chat = document.getElementById("chat");
    var users = document.getElementById("participants");
    if (users.style.display === "none") {
        if(chat.style.display !== "none")
            chat.style.display = "none"
        users.style.display = "flex";
        contract_main_div();
    } else {
        users.style.display = "none";
        expand_main_div();
    }
}