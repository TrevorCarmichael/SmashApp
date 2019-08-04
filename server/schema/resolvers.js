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
        tournament: (_, {tournamentID, eventID, slug}) => {
            return new Promise((resolve, reject) => {
                let query = {};
                if(tournamentID) query.tournamentID = tournamentID;
                if(eventID) query.eventID = eventID;
                if(slug) query.slug = slug;
                tournaments.findOne(query, (error, results) => { error ? reject(error) : resolve(results)});
            });
        }, 
        tournament_smashgg: (_, {slug}) => {
            return new Promise((resolve, reject) => {
                smash.getTournamentByName(slug).then((results) => {
                    resolve({
                        tournamentID: results.id,
                        name: results.name,
                        date: results.startAt,
                        slug: results.slug
                    });
                });
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

            addSets(event.id);

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
        addSets: (_, {eventID}) => {return addSets(eventID)}
    },
    Tournament: {
        sets(tournament) {
            return new Promise((resolve, reject) => {
                sets.find({
                    eventID: tournament.eventID
                }, (error, results) => {
                    error ? reject(error) : resolve(results);
                });
            });
        },
        formattedDate(tournament) {
            let newDate = new Date(tournament.date*1000);
            return newDate.toLocaleDateString();
        }
    },
    Placement: {
        player (placement) {
            return new Promise((resolve, reject) => {
                players.findById(placement.playerID, (error, result) => {
                    error ? reject(error) : resolve(result);
                });
            });
        }
    }
};

getPlayerByGamerTag = async (x) => await players.findOne({name: x});

async function addSets(eventID) {
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
}

