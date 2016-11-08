const LocalStrategy    = require('passport-local').Strategy;
const User             = require('../app/models/user');
const generator        = require('generate-password');
const validator        = require('validator');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },

    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase();

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                else
                    return done(null, user);
            });
        });

    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true
    },

    function(req, email, done) {
        if (email)
            email = email.toLowerCase();

        // asynchronous
        process.nextTick(function() {
            if (!req.user) {
                console.log('bla1');
                User.findOne({ 'local.email' :  email + '@mhp.com'}, function(err, user) {
                    if (err)
                        console.log('bla4');
                        return done(err);
                    if (user) {
                        console.log('bla2');
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        console.log('bla3');
                        var newUser            = new User();
                        var DbEmail = email + '@mhp.com';
                        if (validator.isEmail(DbEmail)) {
                            var password = generator.generate({
                            length: 5,
                            numbers: true
                            });
                        }
                        console.log('User: ', email,  ' Passwort: ', password);

//                                 // send mail with defined transport object
//                                 // setup e-mail data with unicode symbols
//                                 var mailOptions = {
//                                     from: '"Stefan Muderack" <hello@b1k8.de>', // Sender Adresse
//                                     to: email + '; smudera@gmail.com', // Hier sollte eigentlich die E-Mail eingefügt werden
//                                     subject: 'MHP Insight App Companion Nutzerdaten', // Titel der E-Mail
//                                     text: 'Hallo ' + realFirstName + '', // plaintext body
//                                     html: 'Hallo ' + realFirstName + '</br> </br> vielen Dank für deine Anmeldung bei der Insight Companion Applikation, dein Passwort ist:<b>' + password + ' </b>. </br></br> Beste Grüße, dein Insight-App Entwicklungsteam' // html body
//                                 };
//
//                                 transporter.sendMail(mailOptions, function (error, info) {
//                                     if (error) {
//                                         return console.log(error);
//                                     }
//                                     console.log('Message sent: ' + info.response);
//                                 });
                        newUser.local.email     = DbEmail;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            } else if ( !req.user.local.email ) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    console.log('bla4');
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                    } else {
                        var user = req.user;
                        user.local.email = email;
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            return done(null,user);
                        });
                    }
                });
            } else {
                return done(null, req.user);
            }

        });

    }));

};
