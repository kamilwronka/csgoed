const { isEmpty, max } = require("lodash");
const ip = require("ip").address();
const config = require("../config");

const helpers = require("../helpers");

exports.csgo = ({
  name,
  ownerId,
  serverName,
  rconPassword,
  srcdsToken,
  serverPassword,
  fpsMax,
  fpsUncapped,
  tickrate,
  maxPlayers,
  region = 3,
  startMap,
  mapGroup = "mg_active"
}) => {
  return helpers
    .getOpenPorts(2, { min: 27015, max: 28000 })
    .then(ports => {
      return {
        containerConfig: {
          Image: "kamilwronka7/csgo-sourcemod",
          HostConfig: {
            PortBindings: {
              "27015/udp": [{ HostPort: String(ports[0]) }],
              "27015": [{ HostPort: String(ports[0]) }],
              "27020/udp": [{ HostPort: String(ports[1]) }],
              "27020/tcp": [{ HostPort: String(ports[1]) }]
            }
          },
          ExposedPorts: {
            "27015/udp": {},
            "27015": {},
            "27020/udp": {},
            "27020/tcp": {}
          },
          Env: [
            `SRCDS_RCONPW=${rconPassword}`,
            `SRCDS_PW=${serverPassword ? serverPassword : ""}`,
            `SRCDS_FPSMAX=${fpsUncapped ? 0 : fpsMax}`,
            `SRCDS_TICKRATE=${tickrate}`,
            `SRCDS_MAXPLAYERS=${maxPlayers}`,
            `SRCDS_REGION=${region}`,
            `SRCDS_STARTMAP=${startMap}`,
            `SRCDS_MAPGROUP=${mapGroup}`,
            `SRCDS_TOKEN=${srcdsToken}`
          ],
          Tty: true,
          AttachStdin: true,
          Labels: {
            ownerId: ownerId,
            hltvPort: String(ports[1]),
            serverPort: String(ports[0]),
            name: name,
            game: "csgo",
            ip
          }
        }
      };
    })
    .catch(error => {
      throw new Error(error);
    });
};
