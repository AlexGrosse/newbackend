// load the things we need
const mongoose = require('mongoose');

// define congrats data model
const congratsSchema = mongoose.Schema({
        id           : String,
        UserID       : String,
        text         : String,
        surname      : String,
        firstname    : String,
        timestamp    : String
});

// create the model for congrats and expose it to our app
module.exports = mongoose.model('Congrats', congratsSchema);