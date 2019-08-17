const database = require('../database/database');
const smashgg = require('../smashgg/smashgg');
const glicko = require('glicko2-js');
const smash = new smashgg(process.env.SMASHGG);

module.exports = {
    addTournament: async (_, {slug, eventID}) => {
        let tournament = await smash.getTournamentByName(slug);
        let event = tournament.events.length === 1 || eventID === undefined 
            ? tournament.events[0] : tournament.events.find((x) => x.id === eventID);

        let participants = await smash.getEventStandings(event.id);

        let updatedParticipants = await Promise.all(participants.map(async (x) => {
            let name = x.entrant.participants[0].gamerTag;
            let newPlayer = await database.addPlayer(name);

            return {
                playerID: newPlayer.id,
                name: newPlayer.name,
                placement: x.placement
            };
        }));

        database.addSets(event.id);
        let tempDate = new Date(tournament.startAt * 1000);
        console.log(tempDate);
        let tournamentDate = new Date(Date.UTC(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()));
        let newTourn = database.addTournament(tournament.id, {
            tournamentID: tournament.id,
            eventID: event.id,
            eventName: event.name,
            name: tournament.name,
            date: tournamentDate.getTime()/1000,
            slug: tournament.slug,
            participants: updatedParticipants
        });
        return newTourn;
    },
    addSets: (_, {eventID}) => database.addSets(eventID),
    addRanking:  (_, {name, startDate, endDate}) => {
        return database.addRanking(name, startDate, endDate);
    },
    calculateRanking: async (_, { id }) => {

        let ratings = new glicko(0.9);

        let players = [];

        let ranking = await database.getRankingByID(id);
        let tournaments = await database.getTournamentsInRange(ranking.startDate, ranking.endDate);
        tournaments = tournaments.sort((a,b) => a.date > b.date ? 1 : -1);
        let sets = tournaments.map(async (tournament) => {

            let tournamentSets = await database.getSets(tournament.eventID);
            tournament.participants.forEach((player) => {
                let existing = players.find((p) => p.name.toLowerCase() === player.name.toLowerCase());
                if(existing === undefined){
                    players.push(ratings.formatPlayer(player.name));
                }
            });

            return new Promise((resolve, reject) => resolve(tournamentSets));
        });

       
        completeSets = await Promise.all(sets);

        completeSets.forEach((tournament) => {
            let formattedSets = [];
            tournament.forEach((set) => {

                formattedSets.push([set.winnerName.toLowerCase(), set.loserName.toLowerCase()]);
            });

            let newPlayers = ratings.calculateRankings(players, formattedSets);

            newPlayers.forEach((p) => {

                let index = players.findIndex((x) => x.name.toLowerCase() === p.name.toLowerCase());
                players[index] = p;
            });

        });

        playerNames = players.map(x => x.name);
        playersFromDB = await database.getPlayersByNames(playerNames);
        
        players.forEach(async x => {
            let tempPlayer = playersFromDB.find(p => p.name_lower === x.name.toLowerCase());
            let result = await database.updatePlayerRanking(tempPlayer._id, tempPlayer.name, id, x.rating, x.rd, x.volatility);
        });
        
        return ranking;
    }
}