var db = require('../db.js')
var validator = require('validator');
var async = require('async');
var congrats = {};

// Absenden eines Glückwunsches
congrats.insertCongrats = function insertCongrats(req, res, next) {

    // Auslesen der Values aus den POST Feldern
    var email = req.username + '@mhp.com'
    var values = {

        // ACHTUNG: UserID!!!!!
        UserID: req.params.author,
        text: req.params.congrats
    }

    var userID, congrats;

    congrats = req.params.congrats;

    if (validator.isEmail(email)) {
        async.series([
            // Auslesen der UserID mit der gecheckted E-Mail Adresse um dem Glückwunsch eine ID zuordnen zu können
            function (callback) {
                db.get().query('SELECT users.id as userid from users where users.email = ?', email, function (err, rows, fields) {
                    if (err) {
                        console.error('CONNECTION error: ', err);
                        callback(err);
                    }
                    else {
                        // Es sollte nur ein Objekt geben ..
                        if (rows.length == 1) {
                            
                            userID = rows[0].userid;
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
                // TODO: Sanitizing und Überprüfung der Daten bevor Sie eingespeist werden
                db.get().query('INSERT INTO congratulation SET ?', { UserID: userID, text: congrats }, function (err, result) {
                    if (err) {
                        console.error('Error: ', err);
                        res.statusCode = 418;
                        callback(err);
                    }
                    // anscheinend wars erfolgreich: also raus aus der Schleife
                    callback();
                })
            },
        ], function (err) {
            if (err) {
                res.statusCode = 401;
                res.json({ err })
                return next();                
            }
            else {
                res.statusCode = 200;
                res.json({ succes: 'yeah motherfucker' });
                return next();
            }
        });

    }
};


// Obsolete Funktion --> durch User Authentifizierung obsolete
/*
//
// Updaten eines dedizierten Glückwunsches um diesen zu aktiveren
congrats.showCongrats = function showCongrats(req, res, next) {

    db.get().query('UPDATE Congratulation SET visible = 1 where id = ?', [req.params.id], function (err, rows, fields) {
        if (err) {
            console.error('Error: ', err);
            res.statusCode = 418;
            res.send({
                result: 'error'
            })
            return next();
        }
        else {
            res.json({ succes: 'yeah motherfucker' });
            return next();
        }

    })
};


//
// Ausblenden eines dedizierten Glückwunsches
congrats.hideCongrats = function hideCongrats(req, res, next) {
    
    db.get().query('UPDATE Congratulation SET visible = 0 where id = ?', [req.params.id], function (err, rows, fields) {
        if (err) {
            console.error('Error: ', err);
            res.statusCode = 418;
            res.send({
                result: 'error'
            })
            return next();
        }
        else {
            res.json({ succes: 'yeah motherfucker' });
            return next();
        }
    })
};
*/

//
// Anzeigen aller Glückwünsche
congrats.getAllCongrats = function getAllCongrats(req, res, next) {

    var ret
    var congrats = []

    var values = {

        // ACHTUNG: UserID!!!!!
        UserID: req.params.author,
        text: req.params.congrats
    }

    db.get().query('SELECT congrats.id as id,u.lastname as name,u.firstname as firstname, u.title as title, congrats.text as text FROM congratulation congrats LEFT JOIN users u on(congrats.UserID = u.id) order by timestamp desc', function (err, rows, fields) {
        if (err) {

            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
            });
            return next();
        }

        else {
            // Iterieren durch alle Objekte 
            for (var i = 0; i < rows.length; i++) {
                congrats.push({
                    id: rows[i].id,
                    firstname: rows[i].firstname,
                    surname: rows[i].name,
                    title: rows[i].title,
                    text: rows[i].text
                })
            }

            // Ausgabe
            res.set('content-type', 'application/json; charset=utf-8');
            res.json({ congrats });
            return next();
        }
    })
};



//
// Anzeigen aller Glückwünsche
congrats.getAllCongratsLimited = function getAllCongrats(req, res, next) {

    var ret
    var congrats = []

    db.get().query('SELECT congrats.id as id, u.lastname as name,u.firstname as firstname, u.title as title, congrats.text as text FROM congratulation congrats LEFT JOIN users u on(congrats.UserID = u.id) where congrats.id > ? order by timestamp desc', [req.params.id], function (err, rows, fields) {
        if (err) {

            console.error('CONNECTION error: ', err);
            res.statusCode = 503;
            res.send({
                result: 'error',
            });
            return next();
        }

        else {
            // Iterieren durch alle Objekte 
            for (var i = 0; i < rows.length; i++) {
                congrats.push({
                    id: rows[i].id,
                    firstname: rows[i].firstname,
                    surname: rows[i].name,
                    title: rows[i].title,
                    text: rows[i].text
                })
            }

            // Ausgabe
            res.set('content-type', 'application/json; charset=utf-8');
            res.json({ congrats });
            return next();
        }
    })
};

module.exports = congrats;