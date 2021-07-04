const users = [];
const addUser = ({ id, name, room }) => {
  // console.log("is this working?")
  const existingUser = users.find(user => user.room === room && user.name === name);
    // if (!name || !room) return { error: 'Username and room are required.' };
    // if (existingUser) return { error: 'Username already exists.' };
    const user = { id, name, room };
    users.push(user);
    // console.log("user.js user : " + user.room)
    return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = (room_id)  => {
  const users_in_room = [];
  // users.filter(user => user.room === room);
  // console.log("getUsersInRoom :: ");
  // console.log(typeof l);
  for(i in users)
    if(users[i].room === room_id)
    users_in_room.push(users[i])
  // console.log(users[a].name + " " + users[a].id + " " + users[a].room);
  // for(i in users_in_room)
  // console.log(users_in_room[i].name)
  return users_in_room;
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom };