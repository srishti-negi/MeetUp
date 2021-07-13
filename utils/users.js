const users = [];

// add user to list of users
const addUser = ({ id, name, room }) => {
  const existingUser = users.find(user => user.room === room && user.name === name);
    const user = { id, name, room };
    users.push(user);
    return { user };
};

// remove user from list of users
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = id => users.find(user => user.id === id);

// get the list of users in a particular meeting.
const getUsersInRoom = (room_id)  => {
  const users_in_room = [];
  for(i in users)
    if(users[i].room === room_id)
    users_in_room.push(users[i])
  return users_in_room;
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom };