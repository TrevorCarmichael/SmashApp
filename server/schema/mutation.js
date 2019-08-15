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
    calculateRanking: (_, id) => {
        let ratings = new glicko(0.9);
        
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