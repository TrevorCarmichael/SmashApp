const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
    eventID: String,
    tournamentID: String,
    name: String,
    participants: [{
        player: String,
        name: String,
        placement: Number
    }]
});

module.exports = mongoose.model('event', eventSchema);