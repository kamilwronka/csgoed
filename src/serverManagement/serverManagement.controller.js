const docker = require("../docker/dockerInstance");

exports.ts3TokenRetrieve = socket => {
  socket.on("ts3TokenRetrieve", async id => {
    let container = await docker.getContainer(id);
    let logs = await container.logs({ stdout: true, stderr: true });
    const logsString = logs.toString("utf8");

    const token = /(?<=token=)(.*)(?=)+/gm.exec(logsString);

    socket.emit("ts3TokenRetrieve", token[0]);
  });
};
