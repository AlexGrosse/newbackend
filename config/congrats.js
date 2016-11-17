const Congrats = require('../app/models/congrats');

module.exports = function(congrats) {


    // Speichern eines Glückwunsches
    congrats.insertCongrats = function insertCongrats(req, res, done) {
        // create the congrat
        var newCongrat = new Congrats();
        Congrats.count({}, function(err,count) {
            if(err) { done(err); }
                var arr = req.body.email.toString().split("@");
                newCongrat.id = count + 1;
                newCongrat.UserID = arr[0];
                newCongrat.text = req.body.text;
                var arr2 = arr[0].split(".");
                newCongrat.firstname = arr2[0];
                newCongrat.surname  = arr2[1];
                newCongrat.timestamp = Math.floor(new Date().getDate());
                newCongrat.save(function (err) {
                    if (err) {
                        return done(err);}
                    res.redirect("/congrats");
                });

        });


    };

    congrats.getAllCongrats = function getAllCongrats(req, res, next) {
        Congrats.find({},function (err, congrats) {
            if (err)
                return congrats(err);
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.set('content-type', 'application/json; charset=utf-8');
            console.log(congrats);
            res.json({ congrats });
            return next();
        });
    };

    congrats.getOneCongratById = function getAllCongrats(req, res, next) {
        console.log(req.params.id);
            Congrats.find({id: req.params.id},function(err, congrats){
                if (err)
                    return done(err);
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                res.header('Access-Control-Allow-Headers', 'Content-Type');
                res.set('content-type', 'application/json; charset=utf-8');
                console.log(congrats);
                res.json({ congrats });
                return next();
            });

    };


};