const tournaments = require('./models/tournament');
const sets = require('./models/set');
const players = require('./models/player');
const rankings = require('./models/rankings');
const playerRankings = require('./models/player_rankings');
const smashgg = require('../../smashgg/smashgg');
const smash = new smashgg(process.env.SMASHGG);

module.exports = {
    getAllTournaments: () => tournaments.getAll(),
    getTournament: (tournamentID, eventID, slug) => tournaments.getTournament(tournamentID, eventID, slug),
    getAllSets: () => sets.getAllSets(),
    getRankingByID: (id) => rankings.getByID(id),
    getPlayersByNames: (names) => players.getPlayers(names),
    getPlayerByName: (name) => players.getByName(name),
    getPlayerByID: (id) => players.getByID(id),
    getPlayerRankingsByRankingID: (id) => playerRankings.getAllByID(id),
    addTournament: (tournamentID, fields) => tournaments.addTournament(tournamentID, fields),
    getSets: (eventID) => sets.getByID(eventID),
    addPlayer: (name) => players.addPlayer(name),
    addSets: async (eventID) => {
        let eventSets = await smash.getEventSets(eventID);

        let addedSets = await Promise.all(eventSets.map(async (set) => {
            let winner = await players.getByName(set.winner.entrant.participants[0].gamerTag);
            let loser = await players.getByName(set.loser.entrant.participants[0].gamerTag);
    
            Promise.all([winner, loser]);

            return await sets.addSet(set.id, {
                setID: set.id,
                eventID: eventID,
                winnerID: winner._id,
                loserID: loser._id,
                winnerName: winner.name,
                loserName: loser.name,
                DQ: set.DQ,
                results: [{
                    playerID: winner._id,
                    name: winner.name,
                    score: set.winnerScore
                },{
                    playerID: loser._id,
                    name: loser.name,
                    score: set.loserScore
                }]
            });
            
        }));
    
        return addedSets;
    },
    addRanking: (name, startDate, endDate) => rankings.addRanking(name, startDate, endDate)
}