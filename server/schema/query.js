const database = require('../database/database');
const smashgg = require('../smashgg/smashgg');
const smash = new smashgg(process.env.SMASHGG);

exports.query = {
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
    rankings: (_, {}) => {
        return database.getAllRankings();
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
};

exports.tournament = {
    sets(tournament) {
        return database.getSets(tournament.eventID);
    },
    formattedDate(tournament) {
        let newDate = new Date(tournament.date*1000);
        return newDate.toLocaleDateString();
    }
};

exports.placement = {
    player (placement) {
        return database.getPlayerByID(placement.playerID);
    }
};

exports.ranking = {
    id(ranking) {
        return ranking._id;
    },
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

exports.ranked_players = {
    final_ranking(ranked_players){
        return ranked_players.ranking - (2*ranked_players.rating_deviation);
    }
}