const { pick, isNil } = require("lodash");
const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../user/user.model");

function tokenForUser(user) {
  const timestamp = new Date(Date.now()).getTime();
  return jwt.sign({ sub: user.id, iat: timestamp }, config.JWT_SECRET, {
    expiresIn: "1h"
  });
}

exports.signup = async (req, res, next) => {
  const { email, password } = pick(req.body, ["email", "password"]);

  if (!email || !password) {
    return res
      .status(422)
      .send({ message: "You must provide email and password.", status: 422 });
  }

  try {
    let user = await User.findOne({ email });

    if (!isNil(user)) {
      return res.status(422).send({
        status: 422,
        message: "User with this e-mail already exists."
      });
    }

    const newUser = new User({
      email,
      password
    });

    await newUser.save();

    return res.send({ token: tokenForUser(newUser) });
  } catch (e) {
    return next(e);
  }
};

exports.signin = function(req, res, next) {
  res.send({ token: tokenForUser(req.user) });
};
