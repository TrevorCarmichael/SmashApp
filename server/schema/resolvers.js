//const database = require('../database/database');
const query = require('./query');
const mutation = require('./mutation');

module.exports = {
    Query: query.query,
    Mutation: mutation,
    Tournament: query.tournament,
    Placement: query.placement,
    Ranking: query.ranking,
    Phase: query.phase
};