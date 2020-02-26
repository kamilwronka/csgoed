const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const production = process.env.NODE_ENV === "production";

const MONGODB_URI = production
  ? process.env.MONGODB_URI
  : "mongodb://localhost:27017/csgoed";

mongoose.connect(`${MONGODB_URI}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true
});

mongoose.connection
  .once("open", () => console.log("Connected to database"))
  .on("error", error => {
    console.warn("Warning", error);
  });
