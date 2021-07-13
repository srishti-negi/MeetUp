# MeetUp

MeetUp is a communication web application. It allows users to interact with each other via group video calls and chats. It also has a feature wherein a group of users can team up and communicate via a common team chatroom and meeting room.

# Demo
https://gorgeous-great-basin-23038.herokuapp.com/

# Features

1. **Group video call**
    1. **Mute/ Unmute** functionality
	  2. **video on/off**
	  3. **list of participants in the meeting**
	  4. **Chat within the meeting**
	  5. **Chat storage** (Optional: Chats of Team meetings are stored however chats of one off personal video calls are not stored)
	  6. Meeting duration **timer**
2. **Teams** : Users can create teams in order to interact with a set of other users  
    1. **Common chatroom** for all team members
    2. **Common meeting room** for all team members
    3. **Chat storage** of team meetings and chatroom conversations
3. **List of all teams of user** : Upon logging in user is able to view all his/her teams
4. **User Authentication**
    1. **User Registeration**
    2. **User Login**
    3. **User Logout**
5. **Join Team**
6. **Create Team**
7. **Join meeting**
8. **Create Meeting**
9. **Invite** to meeting/team

# Tech Stack

 - NodeJS
 - Express 
 - Socket.io 
 - PeerJs 
 - MongoDB Cloud 
 - Passport 
 - HTML 
 - CSS
 - JavaScript  
 - Bootstrap 

# Usage

- Clone the current repo
- create a .ENV file specifying the following parameters:
    - dbURI (<a href = "https://docs.mongodb.com/manual/reference/connection-string/">Cloud database connection String</a>)
    - SECRET_KEY (secret parameter which allows express-session to use it to encrypt the sessionId)
- Install necessary packages via the following command:
   ```
   npm install
   ```
- Awesome! It's time to run the webapp!
  ```
  npm server
  ```
