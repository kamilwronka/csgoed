const { pick, isNil } = require("lodash");
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v1;
const { format } = require("date-fns");

const config = require("../config");
const User = require("../user/user.model");
const mailer = require("../mailer/mailer");
const activateEmailTemplate = require("../mailer/templates/activateAccount");
const helpers = require("../helpers");

function tokenForUser(user) {
  const timestamp = new Date(Date.now()).getTime();
  return jwt.sign({ sub: user.id, iat: timestamp }, config.JWT_SECRET, {
    expiresIn: "1h",
  });
}

exports.signup = async (req, res, next) => {
  const { email, password, name } = pick(req.body, [
    "email",
    "password",
    "name",
  ]);

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
        message: "User with this e-mail already exists.",
      });
    }

    const userIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const newUser = new User({
      email,
      password,
      name,
      // activateToken: newUserActivateToken,
      activated: false,
      loginIPAddresses: [userIP],
    });

    let { _id } = await newUser.save();
    const newUserActivateToken = helpers.generateActivateToken(_id);

    console.log(newUserActivateToken);
    await User.findByIdAndUpdate(
      { _id },
      { activateToken: newUserActivateToken }
    );

    const activationEmail = activateEmailTemplate(
      email,
      name,
      newUserActivateToken
    );

    mailer.messages().send(activationEmail, (err, body) => {
      if (err) {
        console.log(err);
        return res.status(500, "Error");
      }

      return res.send({
        token: tokenForUser(newUser),
        message: "Activation token has been sent to " + email,
      });
    });
  } catch (e) {
    return next(e);
  }
};

exports.signin = function (req, res, next) {
  res.send({ token: tokenForUser(req.user) });
};

exports.sendActivationMail = function (req, res, next) {
  const timestamp = Date.now();
  const resendCooldown = 1000 * 60;

  if (req.user.activated) {
    return res
      .status(400)
      .send({ status: 400, message: "Your account is already activated." });
  }

  if (
    isNil(req.user.resendActivationMailTime) ||
    req.user.resendActivationMailTime + resendCooldown <= timestamp
  ) {
    const newActivationToken = helpers.generateActivateToken(req.user._id);

    User.findByIdAndUpdate(
      { _id: req.user._id },
      { activateToken: newActivationToken, resendActivationMailTime: timestamp }
    ).then(() => {
      const activationEmail = activateEmailTemplate(
        req.user.email,
        req.user.name,
        newActivationToken
      );

      mailer.messages().send(activationEmail, (err, body) => {
        if (err) {
          return res.status(400).send({
            status: 400,
            message:
              "There was a problem with sending your new activation e-mail.",
            err,
          });
        }

        console.log(body);

        return res.send({
          message: `New activation email has been sent to: ${req.user.email}`,
        });
      });
    });
  } else {
    const calculatedDifference =
      req.user.resendActivationMailTime + resendCooldown - timestamp;

    const formattedTime = (calculatedDifference / 60000).toFixed(0);

    return res.status(400).send({
      status: 400,
      message: `You have to wait ${formattedTime} minutes before next attempt.`,
    });
  }
};

exports.activateAccount = function (req, res, next) {
  const { token } = pick(req.body, ["token"]);

  User.findOneAndUpdate(
    { activateToken: token },
    { activated: true, activateToken: null }
  )
    .then(() => {
      res.send({ message: "Account has been activated." });
    })
    .catch((e) => {
      res.status(400).send({
        message: "Unable to activate account or token is expired.",
        status: 400,
      });
    });
};
