"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_yoga_1 = require("graphql-yoga");
const logger = require("morgan");
const passport = require("passport");
const passport_kakao_1 = require("passport-kakao");
const mongoose = require("mongoose");
const user_model_1 = require("./models/user.model");
require("dotenv/config");
const BASE_URL = process.env.BASE_URL;
class App {
    constructor(controllers, typeDefs, resolvers) {
        this.app = new graphql_yoga_1.GraphQLServer({ typeDefs, resolvers });
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializePassport();
        this.initializeErrorHandling();
    }
    listen() {
        this.app.start({ port: process.env.PORT || 4000 }, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        this.app.express.use(logger("dev"));
        this.app.express.get("/login", passport.authenticate("kakao"));
        this.app.express.get("/oauth", function (req, res, next) {
            console.log("/oauth");
            passport.authenticate("kakao", function (err, user) {
                console.log("passport.authenticate(kakao)실행");
                if (!user) {
                    return res.redirect("/login");
                }
                req.logIn(user, function (err) {
                    console.log("kakao/callback user : ", user);
                    return res.redirect("/");
                });
            })(req, res);
        });
        //this.app.use(bodyParser.json());
        //this.app.use(cookieParser());
    }
    initializeErrorHandling() {
        //this.app.use(errorMiddleware);
    }
    initializeControllers(controllers) {
        /*
        controllers.forEach((controller) => {
          this.app.use("/", controller.router);
        });
        */
    }
    initializePassport() {
        const PORT = process.env.PORT;
        passport.use(new passport_kakao_1.Strategy({
            clientID: "ea6f8065edc4eeaca91beaf985d1db70",
            clientSecret: "",
            callbackURL: `/oauth`,
        }, function (accessToken, refreshToken, profile, done) {
            user_model_1.default.findOne({
                "kakao.id": profile.id,
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new user_model_1.default({
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
                        return done(err, user);
                    });
                }
                else {
                    return done(err, user);
                }
            });
        }));
    }
    connectToTheDatabase() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`, {
            useNewUrlParser: true,
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map