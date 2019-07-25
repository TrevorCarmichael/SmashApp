const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerSchema = new Schema({
    id: String,
    name: String
});

module.exports = mongoose.model('player', playerSchema);