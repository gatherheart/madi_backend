"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const resolvers = {
    Query: {
        hello: (_, { name }) => `Hello ${name || "World"}`,
    },
};
const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;
const app = new app_1.default([], typeDefs, resolvers);
app.listen();
//# sourceMappingURL=server.js.map