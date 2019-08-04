const {gql} = require('apollo-server');

module.exports = gql`
type Query {
    tournaments: [Tournament]
    tournament(slug: String, tournamentID: String, eventID: String): Tournament

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
    id: ID!
    tournamentID: String!
    eventID: String!
    eventName: String!
    name: String!
    date: String
    slug: String
    participants: [Placement]
    sets: [Set]
}

type Placement {
    player: Player!
    name: String!
    placement: Int!
}
type Player {
    id: ID!
    name: String!
}

type Set {
    id: ID!
    eventID: String!
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
