var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 4000;
var socketioJwt = require('socketio-jwt');
console.log("jwt: ", socketioJwt);
// return any file in the build dir except server.js
app.use('/', function (req, res, next) {
    if (req.originalUrl === '/server.js') {
        return res.status(403).end('403 Forbidden');
    }
    return res.sendFile(__dirname + req.originalUrl);
});


io.on('connection', socketioJwt.authorize({
    secret: 'your secret or public key',
    timeout: 15000 // 15 seconds to send the authentication message
})).on('authenticated', function (socket) {
    //this socket is authenticated, we are good to handle more events from it.
    console.log('hello! ' + socket.decoded_token.name);
}).on('unauthenticated', (err) => {
    console.log("not authenticated")
});

server.listen(port);