const { pick } = require("lodash");

exports.user = function(req, res, next) {
  const desiredData = pick(req.user, ["name", "email", "activated"]);

  res.send(desiredData);
};

exports.userPayments = function(req, res, next) {
  const { payments } = pick(req.user, ["payments"]);

  res.send(payments);
};
