const database = require('../database/database');
const smashgg = require('../smashgg/smashgg');
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

        let newTourn = database.addTournament(tournament.id, {
            tournamentID: tournament.id,
            eventID: event.id,
            eventName: event.name,
            name: tournament.name,
            date: tournament.startAt,
            slug: tournament.slug,
            participants: updatedParticipants
        });
        return newTourn;
    },
    addSets: (_, {eventID}) => {return addSets(eventID)},
    addRanking:  (_, {name, startDate, endDate}) => {
        return database.addRanking(name, startDate, endDate);
    }
}