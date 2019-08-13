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

setSchema.statics.addSet = function(setID, fields) {
    return this.findOneAndUpdate(
        {setID: setID}, 
        fields, 
        {upsert: true, new: true});
}

module.exports = mongoose.model('set', setSchema);