const jsonwebtoken = require("jsonwebtoken");

const User = require("../user/user.model");
const config = require("../config");

module.exports = async token => {
  if (token) {
    const payload = jsonwebtoken.verify(token, config.JWT_SECRET);
    const user = await User.findById(payload.sub);

    return user;
  } else {
    return Promise.resolve(null);
  }
};
