const { pick, max, isEmpty } = require("lodash");
const Docker = require("dockerode");
const ip = require("ip").address();

const User = require("../user/user.model");

const docker = new Docker({
  socketPath: "/var/run/docker.sock"
});

exports.serversList = async (req, res, next) => {
  docker.listContainers({ all: true }, (error, containers) => {
    if (error) {
      res.status(500).send({ message: "Internal server error", status: 500 });
      return;
    }

    const desiredData = containers.map(container => {
      return { ...container, Ip: ip };
    });

    res.send(desiredData);
  });
};

exports.createServer = socket => {
  socket.on("createServer", async data => {
    const { name, game } = data;
    let canProceed = true;
    let usedPorts = [];

    // console.log("createe");

    let containerList = await docker.listContainers();

    containerList.forEach(container => {
      if (container.Names.includes(`/${name}`)) {
        canProceed = false;
      }

      usedPorts.push(...container.Ports.map(port => port.PublicPort));
    });

    if (!canProceed) {
      return socket.emit("createServerError", {
        message: "Server with this name already exists."
      });
    }

    const nextPort = !isEmpty(usedPorts) ? max(usedPorts) + 1 : 3000;

    const options = {
      Cmd: ["--name=dupa"],
      Image: "csgoed-image",
      name,
      AttachStdin: true,
      Tty: true,
      HostConfig: {
        PortBindings: {
          "3000/tcp": [{ HostPort: String(nextPort) }]
        }
      },
      ExposedPorts: {
        "3000/tcp": {}
      }
    };

    if (canProceed) {
      docker.createContainer(options, (err, container) => {
        container.attach({ stream: true, stdout: true, stderr: true }, function(
          err,
          stream
        ) {
          stream.pipe(process.stdout);
          stream.on("data", data => {
            socket.emit("createServerLogs", data.toString("utf8"));
          });
        });

        container.start({ name }, () => {
          socket.emit("createServer", { message: "Created " });
        });
      });
    }
  });
};

exports.deleteServer = socket => {
  socket.on("deleteServer", async id => {
    let container = await docker.getContainer(id);

    try {
      socket.emit("deleteServerLogs", id, "Stopping server...");
      await container.stop();
      socket.emit("deleteServerLogs", id, "Server stopped.");
      socket.emit("deleteServerLogs", id, "Removing server...");
      await container.remove();
      socket.emit("deleteServerLogs", id, "Server removed.");
      socket.emit("deleteServer", id);
    } catch (error) {
      if (error.reason === "container already stopped") {
        socket.emit("deleteServerLogs", id, "Removing server...");
        await container.remove();
        socket.emit("deleteServerLogs", id, "Server removed.");
        socket.emit("deleteServer", id);
      }
    }
  });
};

exports.stopServer = socket => {
  socket.on("stopServer", async id => {
    let container = await docker.getContainer(id);

    console.log(container);

    try {
      socket.emit("stopServerLogs", id, "Stopping server...");
      await container.stop();
      socket.emit("stopServerLogs", id, "exited");
      socket.emit("stopServer", id);
    } catch (error) {
      socket.emit("stopServerLogs", id, error.reason);
    }
  });
};

exports.startServer = socket => {
  socket.on("startServer", async id => {
    let container = await docker.getContainer(id);

    try {
      socket.emit("startServerLogs", id, "Starting server...");
      await container.start();
      socket.emit("startServerLogs", id, "running");
      socket.emit("startServer", id);
    } catch (error) {
      socket.emit("startServerLogs", id, error.reason);
    }
  });
};

// exports.deleteServer = async (req, res, next) => {
//   const { id } = req.params;
//   let container = await docker.getContainer(id);

//   try {
//     await container.stop();
//     await container.remove();

//     res.send({ message: "Container successfully removed.", id });
//   } catch (e) {
//     res.status(500).send({ message: "Internal server error", status: 500 });
//     return;
//   }
// };
