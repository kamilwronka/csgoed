const { isEmpty, max } = require("lodash");
const ip = require("ip").address();

const helpers = require("../helpers");

exports.teamspeak = ({ name, ownerId }) => {
  return helpers
    .getOpenPorts(3, { min: 6000, max: 7000 })
    .then((ports) => {
      return {
        regex: /(?<=token=)(.*)(?= )/g,
        executeAfterCreation: (stdout) => {
          return /(?<=token=)(.*)(?= )/g.match(stdout);
        },
        containerConfig: {
          Image: "teamspeak",
          HostConfig: {
            PortBindings: {
              "9987/udp": [{ HostPort: String(ports[0]) }],
              "9987/tcp": [{ HostPort: String(ports[0]) }],
              "10011": [{ HostPort: String(ports[1]) }],
              "30033": [{ HostPort: String(ports[2]) }],
            },
          },
          ExposedPorts: {
            "9987/udp": {},
            "9987/tcp": {},
            "10011": {},
            "30033": {},
          },
          Env: ["TS3SERVER_LICENSE=accept"],
          Tty: true,
          AttachStdin: true,
          Labels: {
            ownerId: ownerId,
            fileTransferPort: String(ports[2]),
            serverQueryPort: String(ports[1]),
            serverPort: String(ports[0]),
            name: name,
            game: "teamspeak",
            ip: "185.238.72.227",
          },
        },
      };
    })
    .catch((error) => {
      throw new Error(error);
    });
};
