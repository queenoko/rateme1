var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var secret = require('../secret/secret');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

//  Passport Middleware for Signup
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
// TO CHECK IF USERS EMAIL ALREADY EXIST IN THE DATABASE
    User.findOne({'email':email}, (err, user) => {
        if(err){
            return done(err);
        }

        if(user){
            return done(null, false, req.flash('error', 'User with Email Already Exist.'));
        }
        // Saving the data in a database
        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);

        newUser.save((err) => {
            return done(null, newUser);
        });
    })
}));

//  Passport Middleware for Login
passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {

// TO CHECK IF USERS PASSWORD ALREADY EXIST IN THE DATABASE
    User.findOne({'email':email}, (err, user) => {
        if(err){
            return done(err);
        }
    
        var messages = [];
    
        if(!user || !user.validPassword(password)){
            messages.push('Email Does Not Exist Or Password is Invalid')
            return done(null, false, req.flash('error', messages));
        }
    
        return done(null, user); 
    });
}));

//PASSPORT MIDDLEWARE FOR FACEBOOK
passport.use(new FacebookStrategy(secret.facebook, (req, token, refreshToken, profile,
    done) => {
        User.findOne({facebook: profile.id}, (err, user) => {
            if(err){
                return done(err);
            }
            if(user){
                return done(null, user);
            }else{
                var newUser = new User();
                newUser.facebook = profile.id;
                newUser.fullname = profile.displayName;
                newUser.email = profile._json.email;
                newUser.tokens.push({token: token});

                newUser.save((err) => {
                    return done(null, newUser);
                })
            }
        })
    }))