const Auth = require("../auth/auth.controller");

module.exports = app => {
  app.post("/signup", Auth.signup);
};
