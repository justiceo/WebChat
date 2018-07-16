require("dotenv").config();
let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io")(server);
let port = process.env.PORT;
let host = process.env.HOST;
let dbClient = require("redis").createClient();
let RedisServer = require("redis-server");
let dbServer = new RedisServer(6379);
let ClientManager = require("./client-manager");
let Handlers = require("./handlers");

let handlers = new Handlers(new ClientManager(dbClient));
handlers.garnish(io);

dbServer.open(err => {
  if (err === null) {
    dbClient.on("error", function(err) {
      console.log("Error " + err);
    });
  }
});

// return any file in the build dir except server.js
app.use("/", function(req, res, next) {
  if (req.originalUrl === "/server.js") {
    return res.status(403).end("403 Forbidden");
  }
  return res.sendFile(__dirname + req.originalUrl);
});

server.listen(port, host, () => {
  console.log("server listening on port: " + host + ":" + port);
});
