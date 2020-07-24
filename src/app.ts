import { GraphQLServer } from "graphql-yoga";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as expressSession from "express-session";
import { Strategy as FacebookStrategy } from "passport-facebook";
import * as mongoose from "mongoose";
import Controller from "./interfaces/controller.interface";
import User from "./models/user.model";

import "dotenv/config";
import "./passport";
import { authenticateJwt, generateToken } from "./passport";

/**
 * 
{
    "domain": "34.64.251.108",
    "hostOnly": true,
    "httpOnly": true,
    "name": "connect.sid",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": true,
    "storeId": "0",
    "value": "s%3AKY9BLk4RBjwr69wrzIhTPAhwXgxl-TsH.bcBOSLtl05T5paaSfR%2FkJh4C1Zo3X009RMl6qc7Mvkg",
    "id": 1
}
]
 */
const BASE_URL = process.env.BASE_URL;

class App {
  public app: GraphQLServer;

  constructor(controllers: Controller[], typeDefs: any, resolvers: any) {
    this.app = new GraphQLServer({ typeDefs, resolvers });

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializePassport();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.start({ port: process.env.PORT || 4000 }, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.express.use(logger("dev"));

    // Initialize Passport and restore authentication state, if any, from the
    // session.
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private initializeErrorHandling() {
    //this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    // Define routes.
    this.app.express.get("/", function (req, res) {
      res.json({ message: "home", user: req.user });
    });

    this.app.express.get("/login/facebook", function (req, res, next) {
      console.log(req.query);
      const { username, email, id } = req.query;
      if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof id !== "string"
      )
        return res.json({ message: "Error", user: req.user });

      User.findOne(
        {
          facebookId: id,
        },
        function (err, user) {
          if (err) {
            return next(err);
          }
          if (!user) {
            user = new User({
              name: username,
              email: email,
              facebookId: id,
              provider: "facebook",
              created: new Date(),
            });

            user.save(function (err) {
              if (err) {
                console.log(err);
              }
              console.log("SAVE ######", generateToken(id, username));
              return generateToken(id, username);
            });
          } else {
            console.log("ALready#$$", generateToken(id, username));
            return generateToken(id, username);
          }
        }
      );
    });

    this.app.express.get("/test", authenticateJwt, (req, res) => {
      if (req.isAuthenticated()) {
        return res.send("Good");
      } else {
        return res.send("not logined");
      }
    });
  }

  private initializePassport() {
    const PORT = process.env.PORT;
  }
  private connectToTheDatabase() {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
    console.log(`trying to connect ${MONGO_USER}...`);
    mongoose
      .connect(`${MONGO_USER}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then(function () {
        console.log(`connected ${MONGO_USER}...`);
      })
      .catch(function (reason) {
        console.log(
          "Unable to connect to the mongodb instance. Error: ",
          reason
        );
      });
  }
}

export default App;
