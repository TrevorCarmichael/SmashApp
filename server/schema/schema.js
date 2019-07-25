const {gql} = require('apollo-server');

module.exports = gql`
type Query {
    tournaments: [Tournament]
    tournament(id: ID!): Tournament
    sets: [Set]
    eventByID(id: ID!): Event
}

type Mutation {
    addTournament(tournamentID: String!, name: String!, date: String): Tournament
    addEvent(eventID: String!, tournamentID: String!, name: String!, participants: [String]): Event
    registerTournamentEvent(tournamentSlug: String!, eventID: Int!): Tournament
}

type Tournament {
    id: ID!
    tournamentID: String!
    name: String!
    date: String
    events: [Event]
}

type Event {
    id: ID!
    eventID: String!
    tournamentID: String!
    name: String!
    participants: [Placement]
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

input ResultInput {
    player: String!,
    score: Int!
}
`;
