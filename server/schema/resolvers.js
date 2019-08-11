const database = require('../database/database');
const smashgg = require('../smashgg/smashgg');
const smash = new smashgg(process.env.SMASHGG);

module.exports = {
    Query: {
        tournaments: () => {
            return database.getAllTournaments();
        },
        tournament: (_, {tournamentID, eventID, slug}) => {
            return database.getTournament(tournamentID, eventID, slug);
        }, 
        tournament_smashgg: (_, {slug}) => {
            return new Promise((resolve, reject) => {
                smash.getTournamentByName(slug).then((results) => {
                    resolve({
                        tournamentID: results.id,
                        name: results.name,
                        date: results.startAt,
                        slug: results.slug,
                        events: results.events
                    });
                });
            });
        },
        sets: () => {
            return database.getAllSets();
        },
        ranking: (_, {id}) => {
            return database.getRankingByID(id);
        },
        players: (_, {names}) => {
            return database.getPlayersByNames(names);
        },
        player: (_, {name}) => {
            return database.getPlayerByName(name);
        },
        entrants_smashgg: (_, {eventID}) => {
            return new Promise((resolve, reject) => {
                smash.getEventEntrants(eventID).then((results) => {
                    resolve(results);
                });
            });
        }
    },
    Mutation: {
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
        addRanking: async (_, {name, startDate, endDate}) => {
            let ranking =  await rankings.create({
                name: name,
                startDate: Date.parse(startDate),
                endDate: Date.parse(endDate)
            });

            return ranking;
        }
    },
    Tournament: {
        sets(tournament) {
            return getRecords(sets, sets.find, [{eventID: tournament.eventID}]);
        },
        formattedDate(tournament) {
            let newDate = new Date(tournament.date*1000);
            return newDate.toLocaleDateString();
        }
    },
    Placement: {
        player (placement) {
            return database.getPlayerByID(placement.playerID);
        }
    },
    Ranking: {
        players (ranking) {
            return database.getPlayerRankingsByRankingID(ranking._id);
        },
        startDate (ranking) {
            let date = new Date(ranking.startDate);
            return date.toDateString();
        },
        endDate (ranking) {
            let date = new Date(ranking.endDate);
            return date.toDateString();
        }
    }
};