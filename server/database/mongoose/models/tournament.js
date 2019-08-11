const mongoose = require('mongoose');
const { Schema } = mongoose;

const tournamentSchema = new Schema({
    tournamentID: String, 
    eventID: String,
    eventName: String,
    name: String,
    date: String,
    slug: String,
    participants: [{
        playerID: String,
        name: String,
        placement: Number
    }]
});

module.exports = mongoose.model('tournament', tournamentSchema);