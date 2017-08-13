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
    setTimeout(() => {
        console.log('mock authed')
        socket.broadcast.emit('authed', {'room': 'abci23', 'phone': '213445'});
    },20000);
    socket.on('tokenRequest', (deviceId) => {
        console.log('recieved token request from: ', deviceId);      
        let token = makeid();  
        // todo: stick it in a database
        authorized[deviceId] = token;
        socket.broadcast.emit('token', token);
        console.log('dispatching token: ', token);
    })
});


server.listen(port, () => {
    console.log('server listening on port: ' + port);
});


var authorized = {};
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+<>?,./;'[]:{}|~`";

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function authenticate(deviceId, token) {
    return authorized[deviceId] === token;
}