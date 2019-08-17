const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerRankingSchema = new Schema({
    rankingID: String,
    playerID: String,
    name: String,
    rating: Number,
    rating_deviation: Number,
    volatility: Number,
    last_tournament: String,
});

playerRankingSchema.statics.getAllByID = function(id) {
    return this.find({rankingID: id});
}

playerRankingSchema.statics.updatePlayer = function(playerID, name, rankingID, rating, rating_deviation, volatility) {
    console.log(playerID);
    console.log(rankingID);
    
    return this.findOneAndUpdate({
        playerID: playerID,
        rankingID: rankingID
    },{
        playerID: playerID,
        name: name,
        rankingID: rankingID,
        rating: rating,
        rating_deviation: rating_deviation, 
        volatility: volatility
    },
    {upsert: true, new: true});
}

playerRankingSchema.statics.createNewRanking = function(playerID, playerName, rankingID, fields) {
    let ratingFields = {rating: 1500, rating_deviation: 200, volatility: 0.06};
    if(fields) {ratingFields = fields}

    console.log("test");
    return this.findOneAndUpdate({
        rankingID: rankingID,
        playerID: playerID
    },{
        rankingID: rankingID,
        playerID: playerID,
        name: playerName,
        rating: ratingFields.rating,
        rating_deviation: ratingFields.rating_deviation,
        volatility: ratingFields.volatility
    },{upsert: true, new: true});

}
module.exports = mongoose.model('playerRanking', playerRankingSchema);