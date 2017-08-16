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

var clients = [
    {
        clientId: "",   // the clients id
        sockets: [],    // yes one client can open multiple sockets
        roomId: "",     // a client can only be in one room (with the phone)
        authToken: "",  // validates authenticity of client
        roomToken: "",  // validates right to join room 
    }
];

var rooms = [
    {
        id: "",
        roomToken: "",
        socketIds: []
    }
];

var authorized = {};
function makeToken() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return "Pi94BXqogmJlqyeEAAAA";
    //return text;
}

function isAuthorized(socket, data) {
    let token = data ? data.auth ? data.auth.authToken : false : false;
    let client = clients.find(c => c.sockets.indexOf(socket) != -1);
    if(!token || !client) return false;
    return client.authToken === token;
}

function addOrUpdateClient(clientId, socket, authToken) {
    let c = clients.find(c => c.clientId === clientId);
    if(c) {
        if(c.sockets.indexOf(socket) === -1)
            c.sockets.push(socket);
        c.authToken = authToken;
    }
    else {
        console.log("creating new client with id " + clientId + " on socket " + socket.id);
        c = { clientId: clientId, sockets: [socket], authToken: authToken }  
        clients.push(c);
    }
    return c;
}
