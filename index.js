const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const router = require("./src/router/router");

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

require("./src/db/mongoose");

app.use(morgan("combined"));
app.use(bodyParser.json({ type: "*/*" }));
router(app);

server.listen(PORT, () => {
  console.log("Server listening on port %s", PORT);
});
