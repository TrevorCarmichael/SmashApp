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

tournamentSchema.statics.getAll = function(){
    return this.find({});
}

tournamentSchema.statics.getTournament = function(tournamentID, eventID, slug){
    let query = {};
    if(tournamentID) query.tournamentID = tournamentID;
    if(eventID) query.eventID = eventID;
    if(slug) query.slug = slug;
    return this.findOne(query);
}

module.exports = mongoose.model('tournament', tournamentSchema);