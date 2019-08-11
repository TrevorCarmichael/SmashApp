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
    getAllTournaments: () => tournaments.getAll(),
    getTournament: (tournamentID, eventID, slug) => tournaments.getTournament(tournamentID, eventID, slug),
    getAllSets: () => sets.getAllSets(),
    getRankingByID: (id) => getRecords(rankings, rankings.findById, [id]),
    getPlayersByNames: (names) => players.getPlayers(names),
    getPlayerByName: (name) => players.getByName(name),
    getPlayerByID: (id) => players.getByID(id),
    getPlayerRankingsByRankingID: (id) => playerRankings.getAllByID(id),
    addTournament: (tournamentID, fields) => {
        return getRecords(tournaments, tournaments.findOneAndUpdate,
             [{tournamentID: tournamentID}, fields , {upsert: true, new: true}]);
    },
    getSets: (eventID) => sets.getByID(eventID),
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