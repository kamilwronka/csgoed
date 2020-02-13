const Servers = require("../servers/servers.controller");

module.exports = (app, socket) => {
  app.post("/servers", (req, res, next) =>
    Servers.createServer(req, res, next, socket)
  );
  app.delete("/servers/:id", (req, res, next) =>
    Servers.deleteServer(req, res, next, socket)
  );
};
