var Congrats = require('../app/models/congrats');

module.exports = function(congrats) {


    // Speichern eines Glückwunsches
    congrats.insertCongrats = function insertCongrats(req, res, done) {
        console.log(req.body.text);
        console.log(req.body.email);

        // create the user
        var newCongrat = new Congrats();

        newCongrat.UserID = req.body.email;
        newCongrat.text = req.body.text;
        console.log(newCongrat);
        newCongrat.save(function (err) {
            if (err)
                return done(err);
            res.redirect('/congrats');
            });

    };

    congrats.getAllCongrats = function getAllCongrats() {

    };



        //
        // var congrats = [];
        //
        // var values = {
        //
        //     // ACHTUNG: UserID!!!!!
        //     UserID: req.params.author,
        //     text: req.params.congrats
        // };
        //
        // db.get().query('SELECT congrats.id as id,u.lastname as name,u.firstname as firstname, u.title as title, congrats.text as text FROM congratulation congrats LEFT JOIN users u on(congrats.UserID = u.id) order by timestamp desc', function (err, rows, fields) {
        //     if (err) {
        //
        //         console.error('CONNECTION error: ', err);
        //         res.statusCode = 503;
        //         res.send({
        //             result: 'error',
        //         });
        //         return next();
        //     }
        //
        //     else {
        //         // Iterieren durch alle Objekte
        //         for (var i = 0; i < rows.length; i++) {
        //             congrats.push({
        //                 id: rows[i].id,
        //                 firstname: rows[i].firstname,
        //                 surname: rows[i].name,
        //                 title: rows[i].title,
        //                 text: rows[i].text
        //             })
        //         }
        //
        //         // Ausgabe
        //         res.set('content-type', 'application/json; charset=utf-8');
        //         res.json({ congrats });
        //         return next();
        //     }
        // })
};