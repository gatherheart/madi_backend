import { GraphQLServer } from "graphql-yoga";
import * as logger from "morgan";
import * as passport from "passport";
import * as expressSession from "express-session";
import { Strategy as KakaoStrategy } from "passport-kakao";
import * as mongoose from "mongoose";
import Controller from "./interfaces/controller.interface";
import User from "./models/user.model";

import "dotenv/config";
import { isAuthenticated } from "./passport";

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
    this.app.express.use(passport.initialize());

    this.app.express.use(
      expressSession({
        secret: "keyboard cat",
        cookie: { maxAge: 60 * 60 * 1000 },

        resave: true,
        saveUninitialized: true,
      })
    );
    this.app.express.use(passport.session());
    this.app.express.use(logger("dev"));
    this.app.express.get(
      "/login",
      passport.authenticate("kakao", { state: "myStateValue" })
    );

    this.app.express.get("/oauth", function (req: any, res: any, next: any) {
      passport.authenticate("kakao", function (err, user) {
        console.log("passport.authenticate(kakao)실행");
        if (!user) {
          return res.redirect("/login");
        }
        req.logIn(user, function (err: any) {
          console.log("kakao/callback user : ");
          return res.redirect("/");
        });
      })(req, res);
    });
    this.app.express.get("/test", isAuthenticated, (req, res) => {
      res.send("GOod");
    });
    //this.app.use(bodyParser.json());
    //this.app.use(cookieParser());
  }

  private initializeErrorHandling() {
    //this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    /*
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
    */
  }
  private initializePassport() {
    const PORT = process.env.PORT;

    passport.use(
      new KakaoStrategy(
        {
          clientID: "ea6f8065edc4eeaca91beaf985d1db70",
          clientSecret: "", // clientSecret을 사용하지 않는다면 넘기지 말거나 빈 스트링을 넘길 것
          callbackURL: `/oauth`,
        },
        function (accessToken, refreshToken, profile, done) {
          console.log(profile);
          User.findOne(
            {
              "kakao.id": profile.id,
            },
            function (err, user) {
              if (err) {
                return done(err);
              }
              if (!user) {
                user = new User({
                  name: profile.username,
                  username: profile.id,
                  roles: ["authenticated"],
                  provider: "kakao",
                  kakao: profile._json,
                });

                user.save(function (err) {
                  if (err) {
                    console.log(err);
                  }
                  console.log("SAVE ######");
                  return done(err, user);
                });
              } else {
                return done(err, user);
              }
            }
          );
        }
      )
    );
    passport.serializeUser((user: { _id: String }, done) => {
      // Strategy 성공 시 호출됨
      done(null, user._id); // 여기의 user._id가 req.session.passport.user에 저장
    });
    passport.deserializeUser((id, done) => {
      // 매개변수 id는 req.session.passport.user에 저장된 값
      User.findById(id, (err, user) => {
        done(null, user); // 여기의 user가 req.user가 됨
      });
    });
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
