const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerRankingSchema = new Schema({
    rankingID: String,
    playerID: String,
    name: String,
    rating: Number,
    rating_deviation: Number,
    volatility: Number,
    final_ranking: Number
});

playerRankingSchema.statics.getAllByID = function(id) {
    return this.find({rankingID: id});
}
module.exports = mongoose.model('playerRanking', playerRankingSchema);