const Servers = require("../servers/servers.controller");
const ServerManagement = require("../serverManagement/serverManagement.controller");

module.exports = socket => {
  Servers.deleteServer(socket);
  Servers.createServer(socket);
  Servers.stopServer(socket);
  Servers.startServer(socket);
  Servers.restartServer(socket);
  Servers.singleServerConnection(socket);
  ServerManagement.ts3TokenRetrieve(socket);
  ServerManagement.csgoInstallPlugin(socket);
};
