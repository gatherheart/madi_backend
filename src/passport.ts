import * as passport from "passport";

export const isAuthenticated = (req: any, res: any, next: any) => {
  passport.authenticate("kakao", function (err, user) {
    if (!user) {
      console.log("NO USER ", user);
      return res.redirect("/login");
    }
  })(req, res);
};
