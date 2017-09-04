var EVENTS = require('./events');
var Client = require('./client');

function Handlers(clientManager) {
    this.TAG = "Handlers: ";
    this.clientManager = clientManager;
    console.log(this.TAG, "initializing...");
}

Handlers.prototype.isAuthorized = function (socket, data) {
    let token = data ? data.auth ? data.auth.authToken : false : false;
    let client = this.clientManager.getClientBySocket(socket);
    if (!token || !client) return false;
    return client.authToken === token;
}

Handlers.prototype.onDisconnect = function onDisconnect(reason) {
    // remove the socket from it's client
    let client = this.clientManager.getClientBySocket(this.socket);
    client.disconnect(this.socket);
}

Handlers.prototype.onTokenRequest = function onTokenRequest(clientId) {
    if (!clientId) {
        console.log('Error:', this.socketName, EVENTS.TOKEN_REQUEST + ' - null deviceId');
        return; // don't generate tokens for nullable clients      
    }
    console.log('Info:', this.socketName, EVENTS.TOKEN_REQUEST + ' - from: client#' + clientId.substring(0,6));
    let client = this.clientManager.create(clientId, this.socket);
    this.socket.emit(EVENTS.TOKEN, client.authToken); // send the token to the one who asked for it (not everyone on the internet lol)

}

Handlers.prototype.onTokenRefresh = function onTokenRefresh(oldToken) {
    let client = this.clientManager.refresh(oldToken);
    if (client) {
        console.log("Info:",this.socketName,"- Updating token from->to: ", oldToken.substring(0,6), client.authToken.substring(0,6));
        this.socket.emit(EVENTS.TOKEN, client.authToken);
    }
    else {
        this.socket.emit(EVENTS.REFRESH_FAIL);
    }
}

Handlers.prototype.onTokenValidate = function onTokenValidate(data) {
    console.log("Info: ",this.socketName, EVENTS.TOKEN_VALIDATE + " for: " + data.message.substring(0,6))
    if (!this.isAuthorized(this.socket, data)) {
        console.error("Error: ", this.socketName, " - The request failed authorization")
        this.socket.emit('authError', 'authToken necessary to make requests');
        return;
    }

    let qrcodeToken = data.message; // the qrcode is a browser's current authToken
    // find the browser associated with this code
    let browser = this.clientManager.getClientByAuthToken(qrcodeToken);
    if (!browser) {
        console.log('Info:', this.socketName, "Browser with authToken not found for token: " + qrcodeToken.substring(0,6));
        return false;
    }
    else
        console.log('Info:', this.socketName, "Found browser with token: ", qrcodeToken.substring(0,6));

    let mobile = this.clientManager.getClientBySocket(this.socket); // phone
    if (!mobile.isMobile) {
        console.log("client trying to act as mobile: ", mobile.activeSocketId, mobile.id)
    }

    // mark the browser as authorized
    this.clientManager.authorize(browser, mobile);

    // send the browser the phone's this.socket.id (room) so it can join it.
    this.socket.to(browser.activeSocketId).emit(EVENTS.ROOM_AUTHED, {
        roomId: this.socket.id, // because this event should only be trigged by the phone
    });
}

Handlers.prototype.onTestAuth = function onTestAuth(data) {
    if (!this.isAuthorized(this.socket, data)) {
        this.socket.emit(EVENTS.TEST_AUTH_FAIL, 'authToken necessary to make requests: ' + data.toString());
        return;
    }
    this.socket.emit(EVENTS.TEST_AUTH_PASS, 'Your token is valid');
}

Handlers.prototype.onError = function onError(error) {
    console.error(error);
}

Handlers.prototype.relay = function(event, args) {
    console.log('Info:', this.socketName, event, ' - is being relayed')
    let client = this.clientManager.getClientBySocket(this.socket);    
    this.socket.to(client.roomId).emit(event, args);
    // this is why clients should disconnect if they're not active
}

// NOTE: transpilers/minifiers can/will change functions names - which would break this code
Handlers.prototype.handle = function (fn, args) {
    console.log('Info:', this.socketName, '<-Event: ' + fn.name);
    this[fn.name](args);
}

Handlers.prototype.unhandledEvent = function unhandledEvent(eventName) {    
    let str = typeof(args) == 'object' || typeof(args) == 'undefined' ? '[object]' : args;
    console.log('Info:', this.socketName, "<-Unhandled Event: " + eventName + ", ", str);
}

Handlers.prototype.garnish = function (io) {
    io.on(EVENTS.CONNECTION, (socket) => {
        console.log("clients count, sockets count, connected count ", 
            io.engine.clientsCount, 
            io.sockets.sockets.length, 
            Object.keys(io.sockets.connected).length);
            
        this.socket = socket;
        this.socketName = "soc#" + socket.id.substring(0,6);
        this.socket.on(EVENTS.DISCONNECT,       res => {this.handle(this.onDisconnect, res)});
        this.socket.on(EVENTS.DISCONNECTING,       res => {this.unhandledEvent(EVENTS.DISCONNECTING, res)});
        this.socket.on(EVENTS.ERROR,            res => {this.handle(this.onError, res)});

        this.socket.on(EVENTS.TOKEN_REQUEST, res => { this.handle(this.onTokenRequest, res) });
        this.socket.on(EVENTS.TOKEN_REFRESH, res => { this.handle(this.onTokenRefresh, res) });
        this.socket.on(EVENTS.TEST_AUTH, res => { this.handle(this.onTestAuth, res) });
        this.socket.on(EVENTS.TOKEN_VALIDATE, res => { this.handle(this.onTokenValidate, res) });

        // Relay the message between clients
        this.socket.on(EVENTS.CONV_REQUEST, res => { this.relay(EVENTS.CONV_REQUEST, res)});
        this.socket.on(EVENTS.CONV_DATA, res => { this.relay(EVENTS.CONV_DATA, res)});
        this.socket.on(EVENTS.MSG_RECEIVE, res => { this.relay(EVENTS.MSG_RECEIVE, res)});
        this.socket.on(EVENTS.MSG_SENT, res => { this.relay(EVENTS.MSG_SENT, res)});
        this.socket.on(EVENTS.MSG_DELIVERED, res => { this.relay(EVENTS.MSG_DELIVERED, res)});
        this.socket.on(EVENTS.MSG_DELETE, res => { this.relay(EVENTS.MSG_DELETE, res)});
        this.socket.on(EVENTS.CONTACT_REQUEST, res => { this.relay(EVENTS.CONTACT_REQUEST, res)});
        this.socket.on(EVENTS.CONTACt_INFO, res => { this.relay(EVENTS.CONTACt_INFO, res)});
        this.socket.on(EVENTS.SEND_MSG, res => { this.relay(EVENTS.SEND_MSG, res)});

    });
};

module.exports = Handlers
