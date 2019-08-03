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
        addTournament: (_, args) => {
            return tournaments.create(args);
        },
    },

    Placement: {
        player (placement) {
            return new Promise((resolve, reject) => {
                players.findById(placement.player, (error, result) => {
                    error ? reject(error) : resolve(result);
                });
            });
        }
    }
};