const { isEmpty, max } = require("lodash");

exports.teamspeak = usedPorts => {
  const apiPort = !isEmpty(usedPorts) ? max(usedPorts) + 1 : 3000;
  const tsPort = apiPort + 1;

  return {
    networkSettings: {
      HostConfig: {
        PortBindings: {
          "3000/tcp": [{ HostPort: String(apiPort) }],
          "9987/udp": [{ HostPort: String(tsPort) }]
        }
      },
      ExposedPorts: {
        "9987/udp": {},
        "3000/tcp": {}
      }
    },
    exec:
      "/bin/bash linuxgsm.sh ts3server && ./ts3server ai && ./serverfiles/ts3server_startscript.sh start"
  };
};
