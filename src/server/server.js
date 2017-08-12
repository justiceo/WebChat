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


io.on('connection', (socket) => {
    console.log("connected to: ");

    socket.on('tokenRequest', (data) => {
        socket.broadcast.emit('token', 'here is token from server');
        console.log("fulfilled token reqest")
    })
});


server.listen(port, () => {
    console.log('server listening on port: ' + port);
});