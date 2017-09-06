var EVENTS = require('./events');
var Client = require('./client');

function Handlers(clientManager) {
    this.TAG = "Handlers: ";
    this.clientManager = clientManager;
    console.log(this.TAG, "initializing...");
}

Handlers.prototype.isAuthorized = function (socket, data) {
    return true; // todo: fix
}

Handlers.prototype.onDisconnect = function onDisconnect(socket, reason) {
    // remove the socket from it's client
    this.clientManager.disconnect(socket);
}

Handlers.prototype.onTokenRequest = function onTokenRequest(socket, clientId) {
    if (!clientId) {
        console.log('Error:', socket.name, EVENTS.TOKEN_REQUEST + ' - null deviceId');
        return; // don't generate tokens for nullable clients      
    }
    console.log('Info:', socket.name, EVENTS.TOKEN_REQUEST + ' - from: client#' + clientId.substring(0,6));
    this.clientManager.create(clientId, socket, (err, token) => {
        // todo: handle error
        if(token) 
            socket.emit(EVENTS.TOKEN, token);
    });
}

Handlers.prototype.onTokenRefresh = function onTokenRefresh(socket, oldToken) {
    this.clientManager.refresh(oldToken, socket, (err, token)=>{
        if(err == EVENTS.OTHER_SESSION) {
            socket.emit(EVENTS.OTHER_SESSION);
            return;
        }
        else if(err) {
            console.log(this.TAG, err);
            socket.emit(EVENTS.REFRESH_FAIL);
            return;
        }

        if(token) {
            console.log("Info:",socket.name,"- Updating token from->to: ", oldToken.substring(0,6), token.substring(0,6));
            socket.emit(EVENTS.TOKEN, token);
        }
    });
}

Handlers.prototype.onTokenValidate = function onTokenValidate(socket, data) {
    console.log("Info: ",socket.name, EVENTS.TOKEN_VALIDATE + " for: " + data.message.substring(0,6));
    let authToken = "";
    try {
        authToken = data.auth.authToken;
    }catch(e) {
        authToken = null;
    }

    this.clientManager.isValidToken(socket, authToken, (err, valid) => {
        if(valid) {
            let mClientId = this.clientManager.extractClientId(authToken);
            let qrcodeToken = data.message;
            this.clientManager.pair(socket, mClientId, qrcodeToken, (err2, pairedClient) => {
                if(err == INVALID_CLIENT) {
                    this.socket.emit(EVENTS.INVALID_CLIENT);
                }
                if(pairedClient) {
                    this.socket.to(pairedClient).emit(EVENTS.ROOM_AUTHED, "{roomId: hello-data}");
                }
            });
        }
    });
}

Handlers.prototype.onTestAuth = function onTestAuth(socket, data) {
    if (!this.isAuthorized(socket, data)) {
        socket.emit(EVENTS.TEST_AUTH_FAIL, 'authToken necessary to make requests: ' + data.toString());
        return;
    }
    socket.emit(EVENTS.TEST_AUTH_PASS, 'Your token is valid');
}

Handlers.prototype.onError = function onError(socket, error) {
    console.error(error);
}

Handlers.prototype.relay = function(event, socket, args) {
    console.log('Info:', socket.name, event, ' - is being relayed')
    let client = this.clientManager.getClientBySocket(socket);    
    socket.to(client.roomId).emit(event, args);
    // this is why clients should disconnect if they're not active
}

// NOTE: transpilers/minifiers can/will change functions names - which would break this code
Handlers.prototype.handle = function (fn, socket, args) {
    console.log('Info:', socket.name, '<-Event: ' + fn.name);
    this[fn.name](socket, args);
}

Handlers.prototype.unhandledEvent = function unhandledEvent(eventName, socket) {    
    let str = typeof(args) == 'object' || typeof(args) == 'undefined' ? '[object]' : args;
    console.log('Info:', socket.name, "<-Unhandled Event: " + eventName + ", ", str);
}

Handlers.prototype.garnish = function (io) {
    io.on(EVENTS.CONNECTION, (socket) => {
        console.log("clients count, sockets count, connected count ", 
            io.engine.clientsCount, 
            io.sockets.sockets.length, 
            Object.keys(io.sockets.connected).length);
            
        socket.name = "soc#" + socket.id.substring(0,6);
        socket.on(EVENTS.DISCONNECT,       res => {this.handle(this.onDisconnect, socket, res)});
        socket.on(EVENTS.DISCONNECTING,       res => {this.unhandledEvent(EVENTS.DISCONNECTING, socket, res)});
        socket.on(EVENTS.ERROR,            res => {this.handle(this.onError, socket, res)});

        socket.on(EVENTS.TOKEN_REQUEST, res => { this.handle(this.onTokenRequest, socket, res) });
        socket.on(EVENTS.TOKEN_REFRESH, res => { this.handle(this.onTokenRefresh, socket, res) });
        socket.on(EVENTS.TEST_AUTH, res => { this.handle(this.onTestAuth, socket, res) });
        socket.on(EVENTS.TOKEN_VALIDATE, res => { this.handle(this.onTokenValidate, socket, res) });

        // Relay the message between clients
        socket.on(EVENTS.CONV_REQUEST, res => { this.relay(EVENTS.CONV_REQUEST, socket, res)});
        socket.on(EVENTS.CONV_DATA, res => { this.relay(EVENTS.CONV_DATA, socket, res)});
        socket.on(EVENTS.MSG_RECEIVE, res => { this.relay(EVENTS.MSG_RECEIVE, socket, res)});
        socket.on(EVENTS.MSG_SENT, res => { this.relay(EVENTS.MSG_SENT, socket, res)});
        socket.on(EVENTS.MSG_DELIVERED, res => { this.relay(EVENTS.MSG_DELIVERED, socket, res)});
        socket.on(EVENTS.MSG_DELETE, res => { this.relay(EVENTS.MSG_DELETE, socket, res)});
        socket.on(EVENTS.CONTACT_REQUEST, res => { this.relay(EVENTS.CONTACT_REQUEST, socket, res)});
        socket.on(EVENTS.CONTACt_INFO, res => { this.relay(EVENTS.CONTACt_INFO, socket, res)});
        socket.on(EVENTS.SEND_MSG, res => { this.relay(EVENTS.SEND_MSG, socket, res)});

    });
};

module.exports = Handlers
