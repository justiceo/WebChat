import * as dotenv from "dotenv";
import * as express from "express";
import * as http from "http";
import * as socket from "socket.io";
import * as redis from "redis";
import * as redisServer from "redis-server";
import EventHandler from "./event-handler";
import HttpHandler from "./http_handler";
import Cache from "./cache";

const result = dotenv.config({ path: __dirname + "/.env" });
if (result.error) {
  // TODO(justiceo): dotenv is not find the .evn file located at the root as the server is started from dist.
  // even specifying the path (as done above) still resolves to dist.
  // throw result.error;
}
console.log(result.parsed);

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";
const app = express();
const server = http.createServer(app);
const socketServer: SocketIO.Server = socket(server);
const dbClient: redis.RedisClient = redis.createClient();
const dbServer = new redisServer(6379);
const cache:Cache = new Cache();
const httpHandler = new HttpHandler(cache);

const handler = new EventHandler(dbClient, httpHandler, cache);
handler.registerEvents(socketServer);

dbServer.open(err => {
  if (err != null) {
    console.log("RedisServer: " + err);
    return;
  }
});
dbClient.on("error", function(err) {
  console.log("RedisClient: " + err);
});

const router = express.Router();
router.get("/*", (req, res) => {
  if (req.originalUrl === "/index.js") {
    return res.status(403).end("403 Forbidden");
  }
  return res.sendFile(__dirname + req.originalUrl);
});

app.use("/", router);

server.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${host}:${port}`);
});
