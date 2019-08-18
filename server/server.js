if(process.env.NODE_END !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const mongoose = require('mongoose');
const schema = require('./schema/schema');
const resolvers = require('./schema/resolvers');

let db = mongoose.connect(process.env.DB, {useNewUrlParser: true});
let port = process.env.PORT || 8020;

mongoose.connection.once('open', () => {
    mongoose.set('useFindAndModify', false);
    console.log('Connected to Database');
});

const app = express();
app.use(cors());
const server = new ApolloServer({
    typeDefs: schema,
    resolvers
});

server.applyMiddleware({app, path: '/graphql'});

app.listen({port: port}, () => {
    console.log("Server started on http://localhost:" + port);
});
