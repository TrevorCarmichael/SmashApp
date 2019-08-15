const mongoose = require('mongoose');
const { Schema } = mongoose;

const rankingSchema = new Schema({
    name: String,
    startDate: Number,
    endDate: Number
});

rankingSchema.statics.addRanking = function(name, startDate, endDate) {
    let makeDate = (date) => {
        let tempDate = new Date(date + "T23:00:00.000Z");
        let UTCDate = new Date(Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate()));
        return UTCDate.getTime();
    }
    return this.create({
        name: name,
        startDate: makeDate(startDate) / 1000,
        endDate: makeDate(endDate) / 1000
    });
};

rankingSchema.statics.getAllRankings = function() {
    return this.find({});
}
rankingSchema.statics.getByID = function(id) {
    return this.findById(id);
}
module.exports = mongoose.model('ranking', rankingSchema);