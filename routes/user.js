// Model for creating random token
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');

// Random token
var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');

// Passport export
module.exports = (app, passport) => {

    app.get('/', (req, res, next) =>{       
        res.render('index', {title: 'Index || RateMe'}); 
    });
    // Signup Routes
    app.get('/signup', (req, res) => {
        var errors = req.flash('error');
        res.render('user/signup', {title: 'Sign Up || RateMe', messages: errors, hasErrors: errors.length > 0});
    });
    
    app.post('/signup', validate, passport.authenticate('local.signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    // Login Routes
    app.get('/login', (req, res) => {
        var errors = req.flash('error');
        res.render('user/login', {title: 'Login || RateMe', messages: errors, hasErrors: errors.length > 0});
    });
    
    app.post('/login', loginValidation, passport.authenticate('local.login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // Home Routes
    app.get('/home', (req, res) => {
        res.render('home', {title: 'Home || RateMe'});
    });

    // FORGOT PAGE
    app.get('/forgot', (req, res) => {
        var errors = req.flash('error');
        var info = req.flash('info');
        res.render('user/forgot', {title: 'Request Password Reset', messages: errors, hasErrors: errors.length > 0,
        info: info, noErrors: info.length > 0});
    });

    app.post('/forgot', (req, res, next) => {
        async.waterfall([
            function(callback){
               /// Will generate random values(Token) 
                crypto.randomBytes(20, (err, buff) => {
                    var rand = buff.toString('hex');
                    callback(err, rand);
                });
            },

            function(rand, callback){
                User.findOne({'email': req.body.email}, (err, user) => {
                    if(!user){
                        req.flash('error', 'No Account With That Email Exist Or Email is Invalid');
                        return res.redirect('/forgot');
                    }

                    // TIME FOR TOKEN TO EXPIRE
                    user.passwordResetToken = rand;
                    user.passwordResetExpires = Date.now() + 60*60*1000;

                    user.save((err) => {
                        callback(err, rand, user)
                    });
                })
            },

        // Function to send the email to the user
            function(rand, user, callback){
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });
                // Create mail options
                var mailOptions = {
                    to: user.email,
                    from: 'RateMe '+'<'+secret.auth.user+'>',
                  //from: 'RateMe <belachurchill@gmail.com>',
                    subject: 'RateMe Application Password Reset Token',
                    text: 'You have requested for a password reset token. \n\n'+
                        'Please click on the link to complete the process: \n\n'+
                        'http://localhost:3000/reset'+rand+'\n\n'
                };
                // To send Email
                smtpTransport.sendMail(mailOptions, (err, response) => {
                    req.flash('info', 'A password reset token has been sent to '+user.email);
                    return callback(err, user);
                });
            }
        ], (err) => {
            if(err){
                return next(err);
            }
            res.redirect('/forgot');
        })
    });
}

function validate(req, res, next){
    req.checkBody('fullname', 'Fullname is Required').notEmpty();
    req.checkBody('fullname', 'Fullname Must Not Be Less Than 5').isLength({min:5});
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({min:5});
    req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var errors = req.validationErrors();

    if(errors){
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
 
        req.flash('error', messages);
        res.redirect('/signup');
    }else{
        return next();
    }
 }

function loginValidation(req, res, next){
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password', 'Password Must Not Be Less Than 5 Characters').isLength({min:5});
    req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

    var loginErrors = req.validationErrors();

    if(loginErrors){
        var messages = [];
        loginErrors.forEach((error) => {
            messages.push(error.msg);
        });
 
        req.flash('error', messages);
        res.redirect('/login');
    }else{
        return next();
    }
 }