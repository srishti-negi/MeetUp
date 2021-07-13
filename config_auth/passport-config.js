const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/user')

// set passport authentication method
// basically get the user from database
// decrypt the hashed password in database
// compare trhe password entered with the decrypted password

function passport_config(passport) {
    var curr_user;
    const authenticate_user = async (email, password, done) => {
        const user = await User.findOne({email: email}, (err, user) => {
            return user;
        });
        if(user) {
            console.log("user found!!")
        }
        else {
            return done(null, false, {message: "user not found"})
        }
        curr_user = user;
        console.log("Inside passport-config: " + user.email);
        
        if(user == null) {
            return done(null, false, {message: "user not found"})
        }
        try {
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user, {message: "Password incorrect"})
            }
            else {
                return done(null, false, {message: "Password incorrect"})
            }
        }
        catch (e){
            return done(e)
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticate_user));

    // set passport serialiser and deserialiser to manage users across various sessions
    passport.serializeUser((user, done) => { console.log("inside serializer " + user.id) ;done(null, user.id)});
    passport.deserializeUser((id, done) => {
        console.log("inside deserializer "); 
        User.findById(id, (err, user) => { done(null, user);})
    });
}

module.exports = passport_config