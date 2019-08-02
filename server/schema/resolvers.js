const tournaments = require('../models/tournament');
const events = require('../models/event');
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
        tournament: async (_, args) => {
            return new Promise((resolve, reject) => {
                tournaments.findOne({tournamentID: args.slug}, async (error, tournament) => {
                    if(error || tournament === null){
                        tournament = await smash.getTournamentByName(args.slug);
                        console.log("lookup from smashgg");
                        console.log(tournament);
                        resolve({
                            id: tournament.tournament.id,
                            tournamentID: tournament.tournament.id,
                            name: tournament.tournament.name,
                            date: tournament.tournament.startAt,
                            slug: tournament.tournament.slug
                        });
                    } else {
                        console.log("lookup from DB");
                        resolve(tournament);
                    }
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
        eventByID: (_, args) => {
            return new Promise((resolve, reject) => {
                events.findOne({eventID: args.id}, (error, results) => {
                    error ? reject(error) : resolve(results);
                });
            });
        },
        players: (_, args) => {
            return new Promise((resolve, reject) => {
                players.find({}, (error, results) => {
                    console.log('find');
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
        addEvent: (_, args) => {
            let event = events.create(args);
            event.then((x) => console.log(x));
            return event;
        },
        registerTournamentEvent: async (_, args) => {
            let tournament = await smash.getTournamentByName(args.tournamentSlug);
            let updated_tournament = await tournaments.findOneAndUpdate({tournamentID: tournament.tournament.id}, {
                    tournamentID: tournament.tournament.id,
                    name: tournament.tournament.name,
                    date: tournament.tournament.startAt,
                    slug: tournament.tournament.slug
                }, {upsert: true});

            let event = await smash.getEventInfo(args.eventID);
            let event_standings = await smash.getEventStandings(args.eventID);
            let mapped_participants = [];
            for(let player of event_standings) {
                await players.findOneAndUpdate({name: player.entrant.participants[0].gamerTag}, {
                    name: player.entrant.participants[0].gamerTag
                }, {upsert: true, new: true} , (error, doc) => {
                    error ? console.log(error) : console.log(doc);
                    mapped_participants.push({
                        player: doc._id, 
                        name: doc.name,
                        placement: player.placement
                    });
                });
            }
            
            let new_event = await events.findOneAndUpdate({eventID: event.id}, {
                eventID: event.id,
                tournamentID: tournament.tournament.id,
                name: event.name,
                participants: mapped_participants
            }, {upsert:true});

            let event_sets = await smash.getEventSets(event.id);

            for(let set of event_sets) {
                console.log(set.winner.entrant.participants);
                let winner = mapped_participants.find((x) => x.name === set.winner.entrant.participants[0].gamerTag)
                let loser = mapped_participants.find((x) => x.name === set.loser.entrant.participants[0].gamerTag);
                let results = [{
                    player: winner.player,
                    name: winner.name,
                    score: set.winnerScore
                },{
                    player: loser.player,
                    name: loser.name,
                    score: set.loserScore
                }];
                
                await sets.findOneAndUpdate({setID: set.id},{
                    setID: set.id,
                    eventID: event.id,
                    winnerID: winner.player,
                    loserID: loser.player,
                    winnerName: winner.name,
                    loserName: loser.name,
                    DQ: set.DQ, 
                    results: results
                }, {upsert: true});
            }
            return updated_tournament;
        }
    },
    Tournament: {
        events (tournament) {
            return new Promise((resolve, reject) => {
                events.find({tournamentID: tournament.tournamentID}, async (error, eventList) => {
                    console.log(eventList);
                    if(error || eventList === null || eventList.length === 0){
                        console.log("Looking up event via Smash gg");
                        eventsList = await smash.getTournamentByName(tournament.slug);
                        resolve(eventsList.tournament.events);
                    } else {
                        console.log("Getting event from DB");
                        resolve(eventList);
                    }
                });
            });
        }
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