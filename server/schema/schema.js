const {gql} = require('apollo-server');

module.exports = gql`
type Query {
    tournaments: [Tournament]
    tournament(slug: String, tournamentID: String, eventID: String): Tournament
    tournament_smashgg(slug: String!) : Tournament_SmashGG
    sets: [Set]
    players: [Player]
    player(name: String!) : Player
    playersByName(names: [String]) : [Player]
    getParticipants(eventID: String!) : [Player]
}

type Mutation {
    addTournament(slug: String!, eventID: Int): Tournament
    addSets(eventID: Int!): [Set]
    registerTournamentEvent(tournamentSlug: String!, eventID: Int!): Tournament
}

type Tournament {
    tournamentID: ID!
    eventID: ID!
    eventName: String!
    name: String!
    date: Int
    formattedDate: String
    slug: String
    participants: [Placement]
    sets: [Set]
}

type Tournament_SmashGG {
    tournamentID: ID!
    name: String!
    date: Int
    slug: String
}

type Placement {
    player: Player!
    name: String!
    placement: Int!
}
type Player {
    name: String!
}

type Set {
    eventID: ID!
    winnerID: String!
    loserID: String!
    winnerName: String!
    loserName: String!
    DQ: Boolean
    results: [Result]
}

type Result {
    player: Player!
    name: String!
    score: Int!
}
input PlacementInput {
    player: String!
    name: String!
    placement: Int!
}

input ResultInput {
    player: String!,
    score: Int!
}
`;
