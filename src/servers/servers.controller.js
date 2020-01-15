const { pick } = require("lodash");
const { Docker } = require("node-docker-api");

const User = require("../user/user.model");

const docker = new Docker({
  socketPath: "/var/run/docker.sock"
});

exports.serversList = (req, res, next) => {
  //   const servers = pick(req.user, "servers");
  //   res.send(servers);
  docker.container
    .list()
    .then(r => res.send(r))
    .catch(e => res.send(e));
};

exports.createServer = (req, res, next) => {
  const { name, game } = req.body;
  const newServer = {
    name,
    game,
    status: "offline",
    ip: "127.0.0.1"
  };

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { servers: newServer } }
  ).then(() => {
    User.findOne({ _id: req.user._id }).then(user => {
      res.send(pick(user, ["servers"]));
    });
  });
};
