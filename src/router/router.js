const Auth = require("../auth/auth.controller");
const Servers = require("../servers/servers.controller");
const passport = require("passport");
const Games = require("../games/games.controller");

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

  app.get("/servers", Servers.serversList);

  app.get("/games", Games.gamesList);
};
