const stripeConfig = require("../config/stripe");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);
const { pick } = require("lodash");

exports.handleStripePayment = async function (req, res, next) {
  const { data, amount } = req.body;

  try {
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: "pln",
      description: "top up balance",
      source: data.id,
    });

    const newBalance = req.user.payments.balance + Number(amount);

    req.user.payments = {
      balance: newBalance,
      currency: "PLN",
      history: req.user.payments.history.push(charge),
    };

    await req.user.save();

    return res.send({
      message: "Your balance has been updated.",
      balance: newBalance,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      status: 400,
      message: "Unable to top up balance, your Credit Card is not charged.",
    });
  }
};

exports.getClientSecret = async function (req, res, next) {
  const { amount } = pick(req.body, ["amount"]);
  stripe.customers.create();

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: { integration_check: "accept_a_payment" },
  });

  res.send({ client_secret: intent.client_secret });
};

exports.createCustomer;
