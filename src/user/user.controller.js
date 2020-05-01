const { pick } = require("lodash");
const stripeConfig = require("../config/stripe");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);

exports.user = function (req, res, next) {
  const desiredData = pick(req.user, ["name", "email", "activated"]);

  res.send(desiredData);
};

exports.userPayments = function (req, res, next) {
  const { payments } = pick(req.user, ["payments"]);

  res.send(payments);
};

exports.userPaymentMethods = function (req, res, next) {
  // const { consumerId } = pick(req.user, ["consumerId"]);
  const paymentMethod = "pm_1GdNdACncCx7Gp9MsrBlbLoR";

  if (!paymentMethod) {
    return res
      .status(404)
      .send({ message: "No payment methods.", status: 404 });
  }

  // const paymentMethod = stripe.

  return res.send("haha");
};
