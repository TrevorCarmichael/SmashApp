const mongoose = require('mongoose');
const { Schema } = mongoose;

const tournamentSchema = new Schema({
    tournamentID: String, 
    name: String,
    date: String
});

module.exports = mongoose.model('tournament', tournamentSchema);