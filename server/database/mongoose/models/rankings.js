const mongoose = require('mongoose');
const { Schema } = mongoose;

const rankingSchema = new Schema({
    name: String,
    startDate: Number,
    endDate: Number
});

rankingSchema.statics.addRanking = function(name, startDate, endDate) {
    return this.create({
        name: name,
        startDate: Date.parse(startDate),
        endDate: Date.parse(endDate)
    });
};

rankingSchema.statics.getAllRankings = function() {
    return this.find({});
}
rankingSchema.statics.getByID = function(id) {
    return this.findById(id);
}
module.exports = mongoose.model('ranking', rankingSchema);