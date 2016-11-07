// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
var congrats = require('./config/congrats.js');


// configuration ===============================================================
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration
require('./config/congrats')(congrats); // pass congrats for configuration


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set up ejs for templating
app.use('/static', express.static('public'));

// required for passport
app.use(session({
    secret: 's87ts78daskopcsnkefwuzg234osdfuj23ui4feh72323', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport, congrats); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);


// Old Backend Server.js //

/////////////////////////////   Aufsetzen der SMTP Verbindung   ///////////////////////////////////
//var transporter = nodemailer.createTransport('smtps://m03b3996:FhVLYZaFr2dgRFep@w014a18b.kasserver.com');

