const User = require('../app/models/user');
const generator = require('generate-password');
const validator = require('validator');
const nodemailer = require('nodemailer');

module.exports = function (userCreation) {

    userCreation.createUser = function (req, res, done) {
        if (req.body.email) {
            var email = req.body.email.toLowerCase();
        }
        User.findOne({'local.email': email + '@mhp.com'}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
                var newUser = new User();
                var DbEmail = email + '@mhp.com';
                var arr = req.body.email.toString().split(".");
                var realFirstName = arr[0];
                if (validator.isEmail(DbEmail)) {
                    var password = generator.generate({
                        length: 5,
                        numbers: true
                    });
                }
                newUser.local.email = DbEmail;
                newUser.local.password = newUser.generateHash(password);
                var transporter = nodemailer.createTransport('smtps://m03b3996:FhVLYZaFr2dgRFep@w014a18b.kasserver.com');
                var mailOptions = {
                    from: '"Stefan Muderack" <hello@b1k8.de>', // Sender Adresse
                    to: DbEmail, // Hier sollte eigentlich die E-Mail eingefügt werden
                    subject: 'MHP Insight App Companion Nutzerdaten', // Titel der E-Mail
                    text: 'Hallo ' + realFirstName + '', // plaintext body
                    html: 'Hallo ' + realFirstName + '</br> </br> vielen Dank für deine Anmeldung bei der Insight Companion Applikation, dein Passwort ist  <b>' + password + ' </b>. </br></br> Beste Grüße, dein Insight-App Entwicklungsteam' // html body
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                    newUser.save(function (err) {
                        if (err)
                            return done(err);
                        res.redirect('/congrats');
                    });

                });
            }
        });
    };
};