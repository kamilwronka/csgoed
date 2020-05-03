const Docker = require("dockerode");

module.exports = new Docker({
  host: "http://185.238.72.227",
  port: 2376,
  socketPath: false,
});
