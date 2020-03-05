const { pick, max, isEmpty } = require("lodash");
const ip = require("ip").address();
const net = require("net");
const serverConfigs = require("../serverConfigs");

const docker = require("../docker/dockerInstance");

const User = require("../user/user.model");

exports.serversList = async (req, res, next) => {
  const userId = req.user._id;

  console.log(userId);

  docker.listContainers(
    { all: true, filters: `{\"label\": [\"ownerId=${userId}\"]}` },
    (error, containers) => {
      console.log(error);
      if (error) {
        res.status(500).send({ message: "Internal server error", status: 500 });
        return;
      }

      const desiredData = containers.map(container => {
        return { ...container, Ip: ip };
      });

      res.send(desiredData);
    }
  );
};

exports.fetchServerInfo = async (req, res, next) => {
  let container = await docker.getContainer(req.params.id);
  let containerData = await container.inspect();

  res.send(containerData);
};

exports.singleServerConnection = socket => {
  socket.on("singleServerConnection", async data => {
    // const client = new net.Socket();
    // client.connect(3333, "127.0.0.1", () => {
    //   socket.emit("basicServerLogs", {
    //     message: "connected",
    //     type: "success",
    //     id: data.id
    //   });
    // });
    // const msg = { name: data.id + "_log", message: "sumting" };
    // client.write(JSON.stringify(msg));
    // console.log("write");
    // client.on("data", data => {
    //   console.log("Received", data);
    //   const desiredData = data.toString("utf8");
    //   console.log(desiredData);
    //   socket.emit("basicServerLogs", { message: desiredData, type: "info" });
    // });
    console.log(socket.user._id);

    let containerList = await docker.listContainers({
      label: `ownerId=${userId}`
    });
  });
};

exports.createServer = socket => {
  socket.on("createServer", async data => {
    const { name, game } = data;
    let canProceed = true;
    const userId = socket.user._id;
    const servers = socket.user.servers;

    // console.log("createe");

    let containerList = await docker.listContainers();

    containerList.forEach(container => {
      if (container.Names.includes(`/${name}`)) {
        canProceed = false;
      }
    });

    if (!canProceed) {
      return socket.emit("basicServerLogs", {
        message: "Server with this name already exists.",
        type: "error"
      });
    }

    if (canProceed) {
      const serverConfig = await serverConfigs[`${game}`]({
        name,
        ownerId: userId
      });

      // const attachStream = (err, stream) => {
      //   stream.pipe(process.stdout);
      //   stream.on("data", async data => {
      //     const dataString = data.toString("utf8");
      //     console.log(dataString);

      //     socket.emit("createServerLogs", dataString);
      //   });
      // };

      try {
        let container = await docker.createContainer(
          serverConfig.containerConfig
        );

        await container.start();
        let containerData = await container.inspect();

        await User.findByIdAndUpdate(userId, {
          servers: { $push: containerData }
        });
        socket.emit("createServer", { message: "Created", type: "success" });
      } catch (error) {
        if (error.statusCode === 404) {
          console.log("No image present, pulling: %s", serverConfig.Image);
          let stream = await docker.pull(serverConfig.Image);

          stream.pipe(process.stdout);
          stream.on("data", async data => {
            const dataString = data.toString("utf8");
            const dataJSON = JSON.parse(dataString);

            if (dataJSON.status.includes("Downloaded newer image")) {
              let container = await docker.createContainer(
                serverConfig.containerConfig
              );

              let data = await container.start();
              let containerData = await container.inspect();
              // console.log(containerData);
              await User.findByIdAndUpdate(userId, {
                servers: { $push: containerData }
              });

              socket.emit("createServer", {
                message: "Created",
                type: "success"
              });
            }
          });
        }

        return socket.emit("createServer", {
          message: error.json.message,
          type: "error"
        });
      }
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
