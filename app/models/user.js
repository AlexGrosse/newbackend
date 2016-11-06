// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String
    }

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);


// old serverJS

/////////////////////////////   Registrierung eines Users / /////////////////////////////
function generatePassword(req, res, next) {

    var email, first, hashedPassword, surname, inputEmail, realFirstName, realSurname, realTitle
    var parameters = {};

    // Kombinieren des übertragenen Namens mit @mhp.com
    // Erwartetes Ergebnis: vorname.nachname@mhp.com
    // ICH ERSCHAFFE FRANKENSTEIN!!!!
    email = req.params.name + '@mhp.com'


    if (validator.isEmail(email)) {
        // whoa, war doch nur ne E-Mail :)
        inputEmail = req.body.name;
        var arr = inputEmail.toString().split(".")

        //
        // Jetzt noch die Prüfung ob auch wirklich das Format eingehalten wurde ...
        if (arr.length == 2) {

            //
            // Extrahieren des Vornamens und Nachnamens
            firstname = arr[0]
            surname = arr[1]

            //
            // Generierung eines Passworts
            var password = generator.generate({
                length: 5,
                numbers: true
            });

            async.series([
                    // Auslesen des normalisierten Nutzernamens
                    function (callback) {
                        db.get().query('SELECT vorname, nachname, titel FROM employee where EMail = ?', email, function (err, rows, fields) {
                            if (err) {

                                console.error('CONNECTION error: ', err);
                                res.statusCode = 503;
                                res.send({
                                    result: 'error',
                                });
                                return next();
                            }
                            else {

                                // Es sollte nur ein Objekt geben ..
                                if (rows.length == 1) {
                                    realFirstName = rows[0].vorname
                                    realSurname = rows[0].nachname
                                    realTitle = rows[0].titel

                                    callback();
                                }
                                else {
                                    callback('Error: DB');
                                }


                            }
                        });
                    },

                    // Generieren eines Password Hashes
                    function (callback) {
                        //
                        // Im ersten Schritt wird ein Passwort und ein Salt generiert
                        //
                        // Im ersten Schritt wird ein Passwort und ein Salt generiert
                        bcrypt.genSalt(5, function (err, salt) {
                            bcrypt.hash(password, salt, function (err, hash) {
                                hashedPassword = hash;
                                callback();
                            });
                        });

                    },

                    // Eintrag des Users und Versand der E-Mail
                    function (callback) {

                        // Anschließend erfolgt das Speichern in der Datenbank
                        var values = {
                            firstname: realFirstName,
                            lastname: realSurname,
                            title: realTitle,
                            password: hashedPassword,
                            email: email
                        }

                        // Ist das eine sichere Methode um die User zu speichern?
                        db.get().query('INSERT INTO users SET ?', values, function (err, result) {
                            if (err) {
                                console.error('Error: ', err);
                                callback(err);
                            }
                            else {

                                // send mail with defined transport object
                                // setup e-mail data with unicode symbols
                                var mailOptions = {
                                    from: '"Stefan Muderack" <hello@b1k8.de>', // Sender Adresse
                                    to: email + '; smudera@gmail.com', // Hier sollte eigentlich die E-Mail eingefügt werden
                                    subject: 'MHP Insight App Companion Nutzerdaten', // Titel der E-Mail
                                    text: 'Hallo ' + realFirstName + '', // plaintext body
                                    html: 'Hallo ' + realFirstName + '</br> </br> vielen Dank für deine Anmeldung bei der Insight Companion Applikation, dein Passwort ist:<b>' + password + ' </b>. </br></br> Beste Grüße, dein Insight-App Entwicklungsteam' // html body
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        return console.log(error);
                                    }
                                    console.log('Message sent: ' + info.response);
                                });

                                callback();
                            }
                        })
                    }

                ],
                function (err) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) { res.json({ succes: 'false' }) }
                    else { res.json({ succes: 'true' }) }
                });
        }
        else {
            res.json({ error: 'Name not valid' })
        }
    }
    else {
        res.json({ error: 'E-Mail not valid' })
    }
    return next();
};

