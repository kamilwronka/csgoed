const mailgun = require("mailgun-js");
const mailgunConfig = require("../config/mailgun");

const mg = mailgun({
  apiKey: mailgunConfig.MAILGUN_API_KEY,
  domain: mailgunConfig.MAILGUN_DOMAIN,
  // host: mailgunConfig.MAILGUN_HOST
});

module.exports = mg;
