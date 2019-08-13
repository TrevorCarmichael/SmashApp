const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerSchema = new Schema({
    name: String,
    name_lower: String
});

playerSchema.statics.getPlayers = function(names) {
    let lowerNames = names.map(x => x.toLowerCase());
    let query = names ? { name_lower: { $in: lowerNames } } : {};
    return this.find(query);
}

playerSchema.statics.getByName = function(name) {
    let lowerName = name.toLowerCase();
    return this.findOne({name_lower: lowerName});
}

playerSchema.statics.getByID = function(id) {
    return this.findById(id);
}

playerSchema.statics.addPlayer = function(name) {
    return this.findOneAndUpdate(
        {name_lower: name.toLowerCase()},
        {name: name, name_lower: name.toLowerCase()},
        {upsert: true, new: true});
}

module.exports = mongoose.model('player', playerSchema);