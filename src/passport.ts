import * as passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import * as jwt from "jsonwebtoken";
import User from "./models/user.model";

export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};
export const generateToken = (id: string, username: string) =>
  jwt.sign({ id, username }, process.env.JWT_SECRET || "salt");

const verifyUser = async (payload: any, done: any) => {
  console.log(payload);
  try {
    const user = await User.find({ facebookId: payload.id });
    if (user !== null) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
};

export const authenticateJwt = (req: any, res: any, next: () => void) =>
  passport.authenticate("jwt", { session: false }, (error: any, user: any) => {
    console.log(user);

    if (user) {
      req.user = user;
    } else console.log("no user");
    next();
  })(req, res, next);

export const isAuthenticated = (request: any, response: any, next: any) => {
  if (!request.user) {
    return response.status("403").json({
      error: "User is not authorized",
    });
  }
  next();
};
passport.initialize();
passport.use(new Strategy(jwtOptions, verifyUser));

passport.serializeUser((user, done) => {
  // Strategy 성공 시 호출됨
  console.log("serializeUser", user);
  done(null, user); // 여기의 user._id가 req.session.passport.user에 저장
});
passport.deserializeUser((id, done) => {
  // 매개변수 id는 req.session.passport.user에 저장된 값
  User.findById(id, (err, user) => {
    console.log("deserializeUser", user);
    done(null, user); // 여기의 user가 req.user가 됨
  });
});
