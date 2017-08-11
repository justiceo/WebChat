var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 4000;

// return any file in the build dir except server.js
app.use('/', function(req, res, next) {
    if(req.originalUrl === '/server.js') {
        return res.status(403).end('403 Forbidden');
    }
    return res.sendFile(__dirname + req.originalUrl);
});

io.on('connection', function(client) {
	console.log('Client connected...');

	client.on('join', function(data) {
		console.log(data);
	});

	client.on('messages', function(data){
		client.emit('thread', data);
		client.broadcast.emit('thread', data);
	});
});

server.listen(port);