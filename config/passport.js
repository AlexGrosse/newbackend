// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User       = require('../app/models/user');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },

    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.local.email     = email;
                        newUser.local.firstname = "";
                        newUser.local.lastname = "";
                        newUser.local.salt = "";

                        //include new password and email function
                        // old serverJS

/////////////////////////////   Registrierung eines Users / /////////////////////////////
// function generatePassword(req, res, next) {
//
//     var email, first, hashedPassword, surname, inputEmail, realFirstName, realSurname, realTitle
//     var parameters = {};
//
//     // Kombinieren des übertragenen Namens mit @mhp.com
//     // Erwartetes Ergebnis: vorname.nachname@mhp.com
//     // ICH ERSCHAFFE FRANKENSTEIN!!!!
//     email = req.params.name + '@mhp.com'
//
//
//     if (validator.isEmail(email)) {
//         // whoa, war doch nur ne E-Mail :)
//         inputEmail = req.body.name;
//         var arr = inputEmail.toString().split(".")
//
//         //
//         // Jetzt noch die Prüfung ob auch wirklich das Format eingehalten wurde ...
//         if (arr.length == 2) {
//
//             //
//             // Extrahieren des Vornamens und Nachnamens
//             firstname = arr[0]
//             surname = arr[1]
//
//             //
//             // Generierung eines Passworts
//             var password = generator.generate({
//                 length: 5,
//                 numbers: true
//             });
//
//             async.series([
//                     // Auslesen des normalisierten Nutzernamens
//                     function (callback) {
//                         db.get().query('SELECT vorname, nachname, titel FROM employee where EMail = ?', email, function (err, rows, fields) {
//                             if (err) {
//
//                                 console.error('CONNECTION error: ', err);
//                                 res.statusCode = 503;
//                                 res.send({
//                                     result: 'error',
//                                 });
//                                 return next();
//                             }
//                             else {
//
//                                 // Es sollte nur ein Objekt geben ..
//                                 if (rows.length == 1) {
//                                     realFirstName = rows[0].vorname
//                                     realSurname = rows[0].nachname
//                                     realTitle = rows[0].titel
//
//                                     callback();
//                                 }
//                                 else {
//                                     callback('Error: DB');
//                                 }
//
//
//                             }
//                         });
//                     },
//
//                     // Generieren eines Password Hashes
//                     function (callback) {
//                         //
//                         // Im ersten Schritt wird ein Passwort und ein Salt generiert
//                         //
//                         // Im ersten Schritt wird ein Passwort und ein Salt generiert
//                         bcrypt.genSalt(5, function (err, salt) {
//                             bcrypt.hash(password, salt, function (err, hash) {
//                                 hashedPassword = hash;
//                                 callback();
//                             });
//                         });
//
//                     },
//
//                     // Eintrag des Users und Versand der E-Mail
//                     function (callback) {
//
//                         // Anschließend erfolgt das Speichern in der Datenbank
//                         var values = {
//                             firstname: realFirstName,
//                             lastname: realSurname,
//                             title: realTitle,
//                             password: hashedPassword,
//                             email: email
//                         }
//
//                         // Ist das eine sichere Methode um die User zu speichern?
//                         db.get().query('INSERT INTO users SET ?', values, function (err, result) {
//                             if (err) {
//                                 console.error('Error: ', err);
//                                 callback(err);
//                             }
//                             else {
//
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
//
//                                 callback();
//                             }
//                         })
//                     }
//
//                 ],
//                 function (err) { //This function gets called after the two tasks have called their "task callbacks"
//                     if (err) { res.json({ succes: 'false' }) }
//                     else { res.json({ succes: 'true' }) }
//                 });
//         }
//         else {
//             res.json({ error: 'Name not valid' })
//         }
//     }
//     else {
//         res.json({ error: 'E-Mail not valid' })
//     }
//     return next();
// }
//

                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
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
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));

};
