const Servers = require("../servers/servers.controller");

module.exports = socket => {
  Servers.deleteServer(socket);
  Servers.createServer(socket);
  Servers.stopServer(socket);
  Servers.startServer(socket);
  Servers.restartServer(socket);
  Servers.singleServerConnection(socket);
};
