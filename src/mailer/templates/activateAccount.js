const config = require("../../config/index");

module.exports = (to, name, token) => {
  return {
    from: `${config.DOMAIN_NAME} <noreply@${config.DOMAIN_NAME}>`,
    to: `${name} <${to}>`,
    subject: `Account activation - ${config.DOMAIN_NAME}`,
    html: `Activate account: <a href="${config.DASHBOARD_URL}/auth/activate?token=${token}">${config.DASHBOARD_URL}/auth/activate?token=${token}</a>`,
  };
};
