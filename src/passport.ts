import * as passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import jwt from "jsonwebtoken";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};
export const generateToken = (id: any) =>
  jwt.sign({ id }, process.env.JWT_SECRET);

const verifyUser = async (
  payload: { id: any },
  done: (arg0: null, arg1: boolean) => any
) => {
  try {
    const user = await prisma.user({ id: payload.id });
    if (user !== null) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
};

export const authenticateJwt = (
  req: { user: any },
  res: any,
  next: () => void
) =>
  passport.authenticate("jwt", { session: false }, (error: any, user: any) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);

passport.use(new Strategy(jwtOptions, verifyUser));
passport.initialize();
export const isAuthenticated = (req: any, res: any, next: any) => {
  passport.authenticate("kakao", function (err, user) {
    console.log(user);
    if (!user) {
      console.log("NO USER", "Redirection");
      return res.redirect("/login");
    }
  })(req, res);
};

export const authenticateKakao = (req: any, res: any, next: any) => {
  passport.authenticate("kakao", { session: false }, (error, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
