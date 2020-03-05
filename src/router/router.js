const Auth = require("../auth/auth.controller");
const Servers = require("../servers/servers.controller");
const passport = require("passport");
const Games = require("../games/games.controller");
const User = require("../user/user.controller");
const Payments = require("../payments/payments.controller");

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
  app.post("/activate-email", requireAuth, Auth.sendActivationMail);
  app.post("/activate", Auth.activateAccount);

  app.get("/user", requireAuth, User.user);
  app.get("/user/payments", requireAuth, User.userPayments);

  app.post("/payments/stripe", requireAuth, Payments.handleStripePayment);

  app.get("/servers", requireAuth, Servers.serversList);

  app.get("/games", Games.gamesList);
};
