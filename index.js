const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const router = require("./src/router/router");

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

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
app.use(cors(corsOptions));

router(app);

server.listen(PORT, () => {
  console.log("Server listening on port %s", PORT);
});
