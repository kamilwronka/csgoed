const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");
const morgan = require("morgan");
const cors = require("cors");
const router = require("./src/router/router");
const app = express();
const socketEvents = require("./src/socket/socket.events");
const config = require("./src/config");

// const options = {
//   key: fs.readFileSync(config.PRIVATE_KEY),
//   cert: fs.readFileSync(config.CERT)
// };

const server = http.createServer(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 4000;
const production = process.env.NODE_ENV === "production";

const whitelist = ["http://localhost:3000", "https://csgoed.com"];
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

require("./src/db/mongoose");

app.enable("trust proxy");
app.use(morgan("combined"));
app.use(bodyParser.json({ type: "*/*" }));
app.use(cors(production ? corsOptions : {}));

router(app);

io.on("connection", socket => {
  socketEvents(socket);
});

process.stdout.on("resize", console.log);

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port %s", PORT);
});

// server.listen(80, "0.0.0.0", () => {
//   console.log("Server listening on port %s", 80);
// });
