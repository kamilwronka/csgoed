const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const router = require("./src/router/router");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const socketEvents = require("./src/socket/socket.events");

const PORT = process.env.PORT || 4000;

const whitelist = ["http://localhost:3000"];
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

app.use(morgan("combined"));
app.use(bodyParser.json({ type: "*/*" }));
app.use(cors());

router(app);

io.on("connection", socket => {
  socketEvents(socket);
});

process.stdout.on("resize", console.log);

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port %s", PORT);
});
