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
      return socket.emit("basicServerLogs", {
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
          socket.emit("createServer", { message: "Created", type: "success" });
        });
      });
    }
  });
};

exports.deleteServer = socket => {
  socket.on("deleteServer", async id => {
    let container = await docker.getContainer(id);

    try {
      socket.emit("basicServerLogs", {
        id,
        message: "Stopping server...",
        type: "info"
      });
      await container.stop();
      socket.emit("basicServerLogs", {
        id,
        message: "Server stopped.",
        type: "success"
      });
      socket.emit("basicServerLogs", {
        id,
        message: "Removing server...",
        type: "info"
      });
      await container.remove();
      socket.emit("basicServerLogs", {
        id,
        message: "Server removed.",
        type: "success"
      });
      socket.emit("deleteServer", id);
    } catch (error) {
      if (error.reason === "container already stopped") {
        socket.emit("basicServerLogs", {
          id,
          message: "Removing server...",
          type: "info"
        });
        await container.remove();
        socket.emit("basicServerLogs", {
          id,
          message: "Server removed.",
          type: "success"
        });
        socket.emit("deleteServer", { id, status: "deleted" });
      }
    }
  });
};

exports.stopServer = socket => {
  socket.on("stopServer", async id => {
    let container = await docker.getContainer(id);

    console.log(container);

    try {
      socket.emit("basicServerLogs", {
        id,
        message: "Stopping server...",
        type: "info"
      });
      await container.stop();
      socket.emit("basicServerLogs", {
        id,
        message: "exited",
        type: "success"
      });
      socket.emit("stopServer", { id, status: "success" });
    } catch (error) {
      socket.emit("basicServerLogs", {
        id,
        message: error.reason,
        type: "error"
      });
    }
  });
};

exports.startServer = socket => {
  socket.on("startServer", async id => {
    let container = await docker.getContainer(id);

    try {
      socket.emit("basicServerLogs", {
        id,
        message: "Starting server...",
        type: "info"
      });
      await container.start();
      socket.emit("basicServerLogs", {
        id,
        message: "running",
        type: "success"
      });
      socket.emit("startServer", { id, status: "success" });
    } catch (error) {
      socket.emit("basicServerLogs", {
        id,
        message: error.reason,
        type: "error"
      });
    }
  });
};

exports.restartServer = socket => {
  socket.on("restartServer", async id => {
    try {
      let container = await docker.getContainer(id);

      socket.emit("basicServerLogs", {
        id,
        type: "info",
        message: "Restarting server..."
      });
      await container.restart();
      socket.emit("basicServerLogs", {
        id,
        type: "success",
        message: "Server has been restarted."
      });
      socket.emit("restartServer", { status: "success", id });
    } catch (error) {
      socket.emit("basicServerLogs", {
        id,
        type: "error",
        message: `Unable to restart server. \n ${error.reason}`
      });
    }
  });
};
