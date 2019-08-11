const mongoose = require('mongoose');
const { Schema } = mongoose;

const setSchema = new Schema({
    setID: String,
    eventID: String,
    winnerID: String,
    loserID: String,
    winnerName: String,
    loserName: String,
    DQ: Boolean,
    results: [{
        playerID: String,
        name: String,
        score: Number
    }]
});

setSchema.statics.getAllSets = function() {
    return this.find({});
}

setSchema.statics.getByID = function(eventID){
    return this.find({eventID: eventID});
}
module.exports = mongoose.model('set', setSchema);