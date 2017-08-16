require('dotenv').config();
let express     = require('express');
let app         = express();
let server      = require('http').createServer(app);
let io          = require('socket.io')(server);
let port        = process.env.PORT;
let host        = process.env.HOST;

let ClientManager   = require('./client-manager');
let Handlers        = require('./handlers');
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
