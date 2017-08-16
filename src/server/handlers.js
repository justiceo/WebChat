var EVENTS = require('./events');
var Client = require('./client');

function Handlers(clientManager) {
    this.TAG = "Handlers: ";
    this.clientManager = clientManager;
    console.log(this.TAG, "initializing...");
}

Handlers.prototype.isAuthorized = function(socket, data) {
    let token = data ? data.auth ? data.auth.authToken : false : false;
    let client = this.clientManager.getClientBySocket(socket);
    if(!token || !client) return false;
    return client.authToken === token;
}

Handlers.prototype.makeToken = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return "Pi94BXqogmJlqyeEAAAA";
    //return text;
}

Handlers.prototype.garnish = function(io) {
    io.on(EVENTS.CONNECTION, (socket) => {

        console.log(this.TAG, "started new socket: " + socket.id)
        io.to(socket.id).emit('message', "Hey you're now connected to me - says server");
        setTimeout(() => {
            console.log('mock authed')
            socket.broadcast.emit('authed', { 'room': 'abci23', 'phone': '213445' });
        }, 20000);

        
        socket.on(EVENTS.TOKEN_REQUEST, (clientId) => { // clientId is different from socketId  
            if (!clientId) return; // don't generate tokens for nullable clients      
            console.log('recieved token request from: ', clientId, ' on socket: ', socket.id);
            let client = this.clientManager.create(clientId, socket);
            io.to(socket.id).emit(EVENTS.TOKEN, client.authToken); // send the token to the one who asked for it (not everyone on the internet lol)
        });

        socket.on(EVENTS.TOKEN_REFRESH, (oldToken) => {
            let newToken = this.clientManager.refresh(token);
            io.to(socket.id).emit(EVENTS.TOKEN, newToken);
        })

        socket.on(EVENTS.TEST_AUTH, (data) => {
            if (!this.isAuthorized(socket, data)) {
                io.to(socket.id).emit(EVENTS.TEST_AUTH_FAIL, 'authToken necessary to make requests: ' + data.toString());
                return;
            }
            io.to(socket.id).emit(EVENTS.TEST_AUTH_PASS, 'Your token is valid');
        });

        socket.on(EVENTS.TOKEN_VALIDATE, (data) => {
            if (!this.isAuthorized(socket, data)) {
                io.to(socket.id).emit('authError', 'authToken necessary to make requests');
                return;
            }

            let qrcodeToken = data.message; // the qrcode is a browser's current authToken
            console.log("received request to validate: ", qrcodeToken);
            // find the browser associated with this code
            let browser = this.clientManager.getClientById(qrcodeToken);
            if (!browser)
                console.log("browser with not found for token: " + qrcodeToken)
            else
                console.log("found browser with token: ", qrcodeToken);
            let mobile = this.clientManager.getClientBySocket(socket); // phone
            if(!mobile.isMobile) {
                console.log("client trying to act as mobile: ", mobile.activeSocketId, mobile.id)
            }
            // send the browser the phone's socket.id (room) so it can join it.
            socket.to(browser.activeSocketId).emit(EVENTS.ROOM_AUTHED, {
                roomId: socket.id, // because this event should only be trigged by the phone
            });
        })
    });
};

module.exports = Handlers