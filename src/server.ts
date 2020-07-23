import App from "./app";

const resolvers = {
  Query: {
    hello: (_: any, { name }: { name: any }) => `Hello ${name || "World"}`,
  },
};
const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;
const app = new App([], typeDefs, resolvers);

app.listen();
