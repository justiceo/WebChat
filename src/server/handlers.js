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
        console.log("authToke after try: ", authToken, JSON.stringify(data));
    }catch(e) {
        authToken = null;
        socket.emit(EVENTS.AUTH_ERROR);
    }

    this.clientManager.isValidToken(socket, authToken, (err, valid) => {
        if(valid) {
            console.log("tokenValidate: auth is okay");
            let mClientId = this.clientManager.extractClientId(authToken);
            let qrcodeToken = data.message;
            this.clientManager.pair(socket, mClientId, qrcodeToken, (err2, pairedClient, pairedSocket) => {
                if(err) {
                    return socket.emit(EVENTS.AUTH_ERROR);
                }

                console.log("no error during pairing");
                if(pairedClient) {
                    console.log("Info: ", this.TAG, "Pairing ", mClientId, "with", pairedClient, "on socket:", pairedSocket);
                    socket.to(pairedSocket).emit(EVENTS.ROOM_AUTHED, mClientId);
                }
            });
        }
        else {
            console.log("invalid auth key");
            socket.emit(EVENTS.AUTH_ERROR);
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

Handlers.prototype.relayToHost = function(event, socket, args) {
    let str = typeof(args) == 'object' || typeof(args) == 'undefined' ? '[object]' : args;
    console.log('Info:', socket.name, '<-RelayToHost:', event, str);
    let hostId = args.hostId;
    this.clientManager.db.get(hostId, (err, hostSocket) => {
        if(err) {
            console.error(this.TAG, "Error relaying data:- host not found");
            return;
        }
        socket.to(hostSocket).emit(event, args);
        console.log('Info:', socket.name, 'Relaying to host on', hostSocket);
    });
}

Handlers.prototype.relayToClient = function(event, socket, args) {
    let str = typeof(args) == 'object' || typeof(args) == 'undefined' ? '[object]' : args;
    console.log('Info:', socket.name, '<-RelayToClient:', event, str);
    let clientId = args.clientId;
    this.clientManager.db.get(clientId, (err, clientSocket) => {
        if(err) {
            console.error(this.TAG, "Error relaying data:- client not found");
            return;
        }
        socket.to(clientSocket).emit(event, args);
        console.log('Info:', socket.name, 'Relaying to client on', clientSocket);
    });
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
        socket.on(EVENTS.CONV_REQUEST, res => { this.relayToHost(EVENTS.CONV_REQUEST, socket, res)});
        socket.on(EVENTS.CONV_DATA, res => { this.relayToClient(EVENTS.CONV_DATA, socket, res)});
        socket.on(EVENTS.SEND_MSG, res => { this.relayToHost(EVENTS.SEND_MSG, socket, res)});
        socket.on(EVENTS.MSG_RECEIVE, res => { this.relayToClient(EVENTS.MSG_RECEIVE, socket, res)});
        socket.on(EVENTS.MSG_SENT, res => { this.relayToClient(EVENTS.MSG_SENT, socket, res)});
        socket.on(EVENTS.MSG_DELIVERED, res => { this.relayToClient(EVENTS.MSG_DELIVERED, socket, res)});
        socket.on(EVENTS.MSG_DELETE, res => { this.relayToHost(EVENTS.MSG_DELETE, socket, res)});
        socket.on(EVENTS.CONTACT_REQUEST, res => { this.relayToHost(EVENTS.CONTACT_REQUEST, socket, res)});
        socket.on(EVENTS.CONTACt_INFO, res => { this.relayToClient(EVENTS.CONTACt_INFO, socket, res)});

    });
};

module.exports = Handlers
