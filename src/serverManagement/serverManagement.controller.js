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

exports.csgoInstallPlugin = socket => {
  socket.on('csgoInstallPlugin', async ({ id, url }) => {
    let container = await docker.getContainer(id);
    console.log(id);

    try {
      const stream = await container.exec({ Cmd: ["/bin/bash", 'plugin_install.sh', `${url}`, '/csgo/addons/sourcemod'], AttachStdin: true, AttachStdout: true});
      await container.exec({ Cmd: ["/bin/bash", 'csgo/addons/sourcemod/scripting/compile.sh', 'deathmatch.sp'], AttachStdin: true, AttachStdout: true});

      console.log(stream);

      // stream.pipe(process.stdout);
      // stream.on('data' , data => {
      //   console.log(data.toString('utf8'))
      // })

      socket.emit('csgoInstallPlugin', `${url} plugin has been installed.`)
    }
    catch (err) {
      console.log(err);
      socket.emit('csgoInstallPlugin', `err see logs`)
    }   
  })
}