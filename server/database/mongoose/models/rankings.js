const mongoose = require('mongoose');
const { Schema } = mongoose;

const rankingSchema = new Schema({
    name: String,
    startDate: Number,
    endDate: Number
});

module.exports = mongoose.model('ranking', rankingSchema);