const tournaments = require('../models/tournament');
const sets = require('../models/set');
const players = require('../models/player');
const smashgg = require('../smashgg/smashgg');
const smash = new smashgg(process.env.SMASHGG);

module.exports = {
    Query: {
        tournaments: () => {
            return new Promise((resolve, reject) => {
                tournaments.find({}, (error, results) => {
                    error ? reject(error) : resolve(results)
                });
            });
        },
        tournament: async (_, {tournamentID, eventID, slug}) => {
            return new Promise((resolve, reject) => {
                console.log(tournamentID);
                let query = {};
                if(tournamentID) query.tournamentID = tournamentID;
                if(eventID) query.eventID = eventID;
                if(slug) query.slug = slug;
                tournaments.findOne(query, (error, results) => { error ? reject(error) : resolve(results)});
            });
        }, 
        sets: () => {
            return new Promise((resolve, reject) => {
                sets.find({}, (error, results) => {
                    error ? reject(error) : resolve(results);
                });
            });
        },
        players: (_, args) => {
            return new Promise((resolve, reject) => {
                players.find({}, (error, results) => {
                    error ? reject(error) : resolve(results);
                });
            });
        },
        player: (_, args) => {
            return new Promise((resolve, reject) => {
                players.findOne({name: args.name}, (error, results) => {
                    error ? reject(error) : resolve(results);
                });
            })
        },
        playersByName: (_, args) => {
            return new Promise((resolve, reject) => {
                players.find({name: {
                    $in: args.names
                }}, (error, results) => {
                    error ? reject(error) : resolve(results);
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
                let newPlayer = await players.findOneAndUpdate({name: name}, {name: name}, {upsert: true, new: true});
                return {
                    playerID: newPlayer.id,
                    name: newPlayer.name,
                    placement: x.placement
                };
            }));

            return await tournaments.findOneAndUpdate({
                tournamentID: tournament.id
            },{
                tournamentID: tournament.id,
                eventID: event.id,
                eventName: event.name,
                name: tournament.name,
                date: tournament.startAt,
                slug: tournament.slug,
                participants: updatedParticipants
            }, {upsert: true, new: true});
        },
    },
    Tournament: {
        
    },
    Placement: {
        async player (placement) {
            return new Promise((resolve, reject) => {
                players.findById(placement.playerID, (error, result) => {
                    error ? reject(error) : resolve(result);
                });
            });
        }
    }
};