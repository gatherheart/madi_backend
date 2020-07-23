"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_yoga_1 = require("graphql-yoga");
const logger = require("morgan");
require("dotenv/config");
const PORT = process.env.PORT;
const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;
const resolvers = {
    Query: {
        hello: (_, { name }) => `Hello ${name || "World"}`,
    },
};
const server = new graphql_yoga_1.GraphQLServer({ typeDefs, resolvers });
server.express.use(logger("dev"));
server.start({ port: PORT }, () => console.log(`Server is running on http://localhost:${PORT}`));
//# sourceMappingURL=server.js.map