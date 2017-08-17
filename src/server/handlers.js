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

Handlers.prototype.makeToken = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return "Pi94BXqogmJlqyeEAAAA";
    //return text;
}

Handlers.prototype.onTokenRequest = function onTokenRequest(clientId) {
    if (!clientId) {
        console.log(EVENTS.TOKEN_REQUEST + ' - discarding request with null deviceId on socket: ', this.socket.id);
        return; // don't generate tokens for nullable clients      
    }
    console.log(EVENTS.TOKEN_REQUEST + ' - recieved token request from: ', clientId, ' on socket: ', this.socket.id);
    let client = this.clientManager.create(clientId, this.socket);
    this.socket.emit(EVENTS.TOKEN, client.authToken); // send the token to the one who asked for it (not everyone on the internet lol)

}

Handlers.prototype.onTokenRefresh = function onTokenRefresh(oldToken) {
    console.log(EVENTS.TOKEN_REFRESH + " - for socket: " + this.socket.id);
    let newToken = this.clientManager.refresh(oldToken);
    if (newToken)
        this.socket.emit(EVENTS.TOKEN, newToken);
    else {
        this.socket.emit(EVENTS.REFRESH_FAIL);
    }
}

Handlers.prototype.onTokenValidate = function onTokenValidate(data) {
    console.log(this.TAG, "Event: " + EVENTS.TOKEN_VALIDATE + " from: " + this.socket.id + " for: " + data.message)
    if (!this.isAuthorized(this.socket, data)) {
        this.socket.emit('authError', 'authToken necessary to make requests');
        return;
    }

    let qrcodeToken = data.message; // the qrcode is a browser's current authToken
    // find the browser associated with this code
    let browser = this.clientManager.getClientById(qrcodeToken);
    if (!browser)
        console.log("browser with not found for token: " + qrcodeToken)
    else
        console.log("found browser with token: ", qrcodeToken);
    let mobile = this.clientManager.getClientBySocket(this.socket); // phone
    if (!mobile.isMobile) {
        console.log("client trying to act as mobile: ", mobile.activeSocketId, mobile.id)
    }
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

// NOTE: transpilers 
Handlers.prototype.handle = function (fn, args) {
    console.log('<-Event: ' + fn.name);
    this[fn.name](args);
}

Handlers.prototype.unhandledEvent = function unhandledEvent(eventName) {    
    let str = typeof(args) == 'object' ? '[object]' : args;
    console.log("<-Unhandled Event: " + eventName + ", ", str);
}

Handlers.prototype.garnish = function (io) {
    io.on(EVENTS.CONNECTION, (socket) => {
        this.socket = socket;
        this.socket.on(EVENTS.DISCONNECT,       res => {this.unhandledEvent(EVENTS.DISCONNECT, res)});
        this.socket.on(EVENTS.DISCONNECTING,       res => {this.unhandledEvent(EVENTS.DISCONNECTING, res)});
        this.socket.on(EVENTS.ERROR,            res => {this.handle(this.onError, res)});

        this.socket.on(EVENTS.TOKEN_REQUEST, res => { this.handle(this.onTokenRequest, res) });
        this.socket.on(EVENTS.TOKEN_REFRESH, res => { this.handle(this.onTokenRefresh, res) });
        this.socket.on(EVENTS.TEST_AUTH, res => { this.handle(this.onTestAuth, res) });
        this.socket.on(EVENTS.TOKEN_VALIDATE, res => { this.handle(this.onTokenValidate, res) });
    });
};

module.exports = Handlers