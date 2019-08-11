const tournaments = require('./models/tournament');
const sets = require('./models/set');
const players = require('./models/player');
const rankings = require('./models/rankings');
const playerRankings = require('./models/player_rankings');
const smashgg = require('../../smashgg/smashgg');
const smash = new smashgg(process.env.SMASHGG);

let getRecords = (model, func, args) => {
    return new Promise(async (resolve, reject) => {
        let thing = await func.apply(model, args);
        resolve(thing);
    });
}
let getPlayerByGamerTag = async (x) => await players.findOne({name: x});

module.exports = {
    getAllTournaments: () => {
        return getRecords(tournaments, tournaments.find, {});
    },
    getTournament: (tournamentID, eventID, slug) => {
        let query = {};
        if(tournamentID) query.tournamentID = tournamentID;
        if(eventID) query.eventID = eventID;
        if(slug) query.slug = slug;
        return getRecords(tournaments, tournaments.findOne, [query]);
    },
    getAllSets: () => {
        return getRecords(sets, sets.find, [{}]);
    },
    getRankingByID: (id) => {
        return getRecords(rankings, rankings.findById, [id]);
    },
    getPlayersByNames: (names) => {
        let lowerNames = names.map(x => x.toLowerCase());
        let query = names ? { name_lower: { $in: lowerNames } } : {};
        return getRecords(players, players.find, [query]);
    },
    getPlayerByName: (name) => {
        let lowerName = name.toLowerCase();
        return getRecords(players, players.findOne, [{name_lower: lowerName}]);
    },
    getPlayerByID: (id) => {
        return getRecords(players, players.findById, [id]);
    },
    getPlayerRankingsByRankingID: (id) => {
        return getRecords(playerRankings, playerRankings.find, [{rankingID: id}]);
    },
    addTournament: (tournamentID, fields) => {
        return getRecords(tournaments, tournaments.findOneAndUpdate,
             [{tournamentID: tournamentID}, fields , {upsert: true, new: true}]);
    },
    getSets: (eventID) => {
        return getRecords(sets, sets.find, [{eventID: eventID}]);
    },
    addPlayer: (name) => {
        return getRecords(players, players.findOneAndUpdate, [
            {name_lower: name.toLowerCase()},
            {name: name, name_lower: name.toLowerCase()},
            {upsert: true, new: true}
        ]);
    },
    addSets: async (eventID) => {
        let eventSets = await smash.getEventSets(eventID);
        let addedSets = await Promise.all(eventSets.map(async (set) => {
            let results = [];
            let winner, loser;
    
            winnerPromise = getPlayerByGamerTag(set.winner.entrant.participants[0].gamerTag).then((x) => {
                winner = {
                    playerID: x._id,
                    name: x.name,
                    score: set.winnerScore
                 };
                results.push(winner);
            });
    
            loserPromise = getPlayerByGamerTag(set.loser.entrant.participants[0].gamerTag).then((x) => {
                loser = {
                    playerID: x._id,
                    name: x.name,
                    score: set.loserScore
                 };
                results.push(loser);
            });
    
            await Promise.all([winnerPromise, loserPromise]);        
    
            return await sets.findOneAndUpdate({setID: set.id}, {
                setID: set.id,
                eventID: eventID,
                winnerID: winner.playerID,
                loserID: loser.playerID,
                winnerName: winner.name,
                loserName: loser.name,
                DQ: set.DQ,
                results: results
            }, {upsert: true, new: true});
            
        }));
    
        return addedSets;
    },
    addRanking: (name, startDate, endDate) => {
        return getRecords(rankings, rankings.create, [{
            name: name,
            startDate: Date.parse(startDate),
            endDate: Date.parse(endDate)
        }]);
    }
}