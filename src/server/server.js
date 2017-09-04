require('dotenv').config();
let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let port = process.env.PORT;
let host = process.env.HOST;
let dbClient = require('redis').createClient();
let RedisServer = require('redis-server');
let dbServer = new RedisServer(6379);

dbServer.open(err => {
    if (err === null) {
        dbClient.on('error', function (err) {
            console.log('Error ' + err)
        })

        dbClient.set('string key', 'string val', dbClient.print)
        dbClient.hset('hash key', 'hashtest 1', 'some value', dbClient.print)
        dbClient.hset(['hash key', 'hashtest 2', 'some other value'], dbClient.print)

        dbClient.hkeys('hash key', function (err, replies) {
            console.log(replies.length + ' replies:')

            replies.forEach(function (reply, i) {
                console.log('    ' + i + ': ' + reply)
            })

            dbClient.quit()
        });
    }
})




let ClientManager = require('./client-manager');
let Handlers = require('./handlers');
//console.log(clientManagers, handlers);

// return any file in the build dir except server.js
app.use('/', function (req, res, next) {
    if (req.originalUrl === '/server.js') {
        return res.status(403).end('403 Forbidden');
    }
    return res.sendFile(__dirname + req.originalUrl);
});

let handlers = new Handlers(new ClientManager());
handlers.garnish(io);

server.listen(port, host, () => {
    console.log('server listening on port: ' + host + ":" + port);
});
