const Auth = require("../auth/auth.controller");
const passport = require("passport");

require("../auth/passportJwtStrategy.service");
require("../auth/passportLocalStrategy.service");

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

module.exports = app => {
  app.get("/", requireAuth, (req, res) => {
    res.send("dupa");
  });
  app.post("/signup", Auth.signup);
  app.post("/signin", requireSignin, Auth.signin);
};
