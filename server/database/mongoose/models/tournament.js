const mongoose = require('mongoose');
const { Schema } = mongoose;

const tournamentSchema = new Schema({
    tournamentID: String, 
    eventID: String,
    eventName: String,
    name: String,
    date: Number,
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

tournamentSchema.statics.addTournament = function(tournamentID, fields){
    return this.findOneAndUpdate(
        {tournamentID: tournamentID}, 
        fields, 
        {upsert: true, new: true});
}

tournamentSchema.statics.getTournamentsInRange = function(startDate, endDate){
    return this.find({
        date: { $gte: startDate, $lte: endDate}
    });
}
module.exports = mongoose.model('tournament', tournamentSchema);