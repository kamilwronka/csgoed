const { pick, max, isEmpty } = require("lodash");
const Docker = require('dockerode');

const User = require("../user/user.model");

const docker = new Docker({
  socketPath: "/var/run/docker.sock"
});

exports.serversList = async (req, res, next) => {
  //   const servers = pick(req.user, "servers");
  //   res.send(servers);
  // let containerList = await docker.container
  //   .list();

  //   const statuses = containerList.map(container => {
  //     return container.data;
  //   })

  //   res.send(statuses);
  //   // console.log(statuses);

  docker.listContainers({}, (error, containers) => {
    if (error) {
      res.status(500).send({ message: "Internal server error", status: 500 });
      return;
    }

    console.log(containers);
    res.send(containers);
  })

};

exports.createServer = async (req, res, next) => {
  const { name, game } = req.body;
  let canProceed = true;
  let usedPorts = [];

  let containerList = await docker.listContainers();
  console.log(containerList)

  containerList.forEach(container => {
    if (container.Names.includes(`/${name}`)) {
      canProceed = false;
    }

    usedPorts.push(...container.Ports.map(port => port.PublicPort));
  })

  if (!canProceed) {
    return res.status(400).send({ status: 400, message: "Server with this name already exists." })
  }

  const nextPort = !isEmpty(usedPorts) ? max(usedPorts) + 1 : 3000;

  const options = {
    name,
    HostConfig: {
      PortBindings: {
        "3000/tcp": [{ HostPort: String(nextPort) }]
      }
    },
    ExposedPorts: {
      "3000/tcp": {
      }
    }
  }

  if (canProceed) {
    docker.run('csgoed-image', [], process.stdout, options, function (err, data) {
      console.log(err)
    })
  }

  // let container = await docker.container.create({
  //   Image: 'csgoed-image',
  //   name: name,
  //   port: 3003
  // })
  // await container.start()
  // // .then(container => container.start())

  res.send({ canProceed, usedPorts, message: "Container is now running" })

  // docker.container.create({
  //   Image: 'csgoed-image',
  //   name: ''
  // })
  //   .then(container => container.start())
  //   .then(container => container.stop())
  //   .then(container => container.restart())
  //   .then(container => container.delete({ force: true }))
  //   .catch(error => console.log(error));


  // const newServer = {
  //   name,
  //   game,
  //   status: "offline",
  //   ip: "127.0.0.1"
  // };

  // User.findOneAndUpdate(
  //   { _id: req.user._id },
  //   { $push: { servers: newServer } }
  // ).then(() => {
  //   User.findOne({ _id: req.user._id }).then(user => {
  //     res.send(pick(user, ["servers"]));
  //   });
  // });
};
