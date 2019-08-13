const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerRankingSchema = new Schema({
    rankingID: String,
    playerID: String,
    name: String,
    rating: Number,
    rating_deviation: Number,
    volatility: Number
});

playerRankingSchema.statics.getAllByID = function(id) {
    return this.find({rankingID: id});
}

playerRankingSchema.statics.updatePlayer = function(playerID, name, rankingID, rating, rating_deviation, volatility) {
    return this.findOneAndUpdate({
        playerID: playerID,
        rankingID: rankingID
    },{
        playerID: playerID,
        playerName: name,
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

    return this.create({
        rankingID: rankingID,
        playerID: playerID,
        name: playerName,
        rating: fields.rating,
        rating_deviation: fields.rating_deviation,
        volatility: ratingFields.volatility
    });
}
module.exports = mongoose.model('playerRanking', playerRankingSchema);