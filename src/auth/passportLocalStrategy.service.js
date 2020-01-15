const passport = require("passport");
const User = require("../user/user.model");
const LocalStrategy = require("passport-local");

const localOptions = { usernameField: "email" };

const localLogin = new LocalStrategy(localOptions, function(
  email,
  password,
  done
) {
  User.findOne({ email }, function(err, user) {
    if (err) return done(err);

    if (!user) return done(null, false);

    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if (!isMatch) return done(null, false);

      return done(null, user);
    });
  });
});

passport.use(localLogin);
