const uuid = require("uuid").v1;
const portastic = require("portastic");

const config = require("../config");

exports.generateActivateToken = id => {
  return Buffer.from(id + "," + uuid()).toString("base64");
};

exports.decodeActivateToken = token => {
  return Buffer.from(token, "base64").toString("utf8");
};

exports.getOpenPorts = amount => {
  return portastic.find({ ...config.PORT_RANGE, retrieve: amount });
};
