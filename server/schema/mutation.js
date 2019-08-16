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

        let ratings = new glicko(1.2);
        console.log(ratings);
        let players = [];

        let ranking = await database.getRankingByID(id);
        let tournaments = await database.getTournamentsInRange(ranking.startDate, ranking.endDate);
        tournaments = tournaments.sort((a,b) => a.startDate > b.startDate ? 1 : -1);
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
        //console.log(players);
        completeSets.forEach((tournament) => {
            let formattedSets = [];
            tournament.forEach((set) => {
                
                formattedSets.push([set.winnerName, set.loserName]);
            });
            let newPlayers = ratings.calculateRankings(players, formattedSets);
            //console.log(newPlayers);
            newPlayers.forEach((p) => {
                let index = players.findIndex((x) => x.name === p.name);
                players[index] = p;
            });

        });

        let newPlayers = players.map((p) => {
            return {
                name: p.name,
                rating: (p.rating),
                rd: p.rd,
                vol: p.volatility
            }
        }).sort((a,b) => a.rating > b.rating ? -1 : 1).forEach(x => {
            console.log(`${x.rating}     -     ${x.name}     -     ${x.rd}     -     ${x.vol}`);
        });
        //console.log(newPlayers);
        //console.log(completeSets);
        //console.log(tournaments);
        //1. Get ranking from DB
        //2. Get tournaments that fall within date
        //3. Loop through each tournament and: 
        //  4. Add all players into Glicko. If they played in a previous tournament do not add them, instead 
        //  5. Get all sets from that tournament
        //  6. Add all the matches to Glicko. 
        //  7. Run calculations
        //  8. If players from previous week did not play this week, apply the inactivity penalty. Only do this if the previous check was > 7 days ago.
        //9. Update players with new ranking values. 
    }
}