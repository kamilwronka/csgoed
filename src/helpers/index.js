const uuid = require("uuid").v1;

exports.generateActivateToken = id => {
  return Buffer.from(id + "," + uuid()).toString("base64");
};

exports.decodeActivateToken = token => {
  return Buffer.from(token, "base64").toString("utf8");
};
