import * as dotenv from "dotenv";
import * as express from "express";
import * as http from "http";
import * as socket from "socket.io";
import * as redis from "redis";
import * as redisServer from "redis-server";
import ClientManager from "./client-manager";
import Handlers from "./handlers";

const result = dotenv.config({ path: __dirname + "/.env" });
if (result.error) {
  // TODO(justiceo): dotenv is not find the .evn file located at the root as the server is started from dist.
  // even specifying the path (as done above) still resolves to dist.
  //throw result.error;
}
console.log(result.parsed);

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";
const app = express();
const server = http.createServer(app);
const io = socket(server);
const dbClient = redis.createClient();
const dbServer = new redisServer(6379);

let handlers = new Handlers(new ClientManager(dbClient));
handlers.garnish(io);

dbServer.open(err => {
  if (err === null) {
    dbClient.on("error", function(err) {
      console.log("Error: " + err);
    });
  }
});

const router = express.Router();
router.get("/server.js", (req, res) => {
  return res.status(403).end("403 Forbidden");
});
router.get("/", (req, res) => {
  // TODO(justiceo): Uncomment to return the index of the web app
  // return res.sendFile(__dirname + req.originalUrl);
  res.json("Hello world!");
});
app.use("/", router);

server.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${host}:${port}`);
});
