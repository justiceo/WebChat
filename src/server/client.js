
/** Creates a new Client object
 * @contructor
 * @param {*} clientId 
 * @param {*} socket 
 * @param {*} authToken 
 */
function Client(clientId, authToken, isMobile) {
    this.TAG            = "Client: ";
    this.id             = clientId;
    this.sockets        = {};
    this.authToken      = authToken;
    this.activeSocketId = "";
    this.isMobile       = isMobile;
    this.roomId         = "";
    this.roomToken      = "";
    this.isAuthorized   = false; // different from isActive()
}

/** Disconnects the given the socket, and if no socket given, disconnect itself
 * @param {*} socket
 */
Client.prototype.disconnect = function(socket) {
    if(this.hasSocket(socket)) {
        console.log(this.TAG, "disconnecting " + socket.id);
        if(socket.id == this.activeSocketId)
            this.activeSocketId = ""; 
        socket.disconnect();
        return;
    }

    console.log("Info: Deactivating client " + this.id);
    this.socList().forEach(s => s.disconnect());
    this.activeSocketId = "";
}

Client.prototype.socList = function() {
    return Object.keys(this.sockets).map(k => this.sockets[k]);
}

Client.prototype.hasActiveSocket = function() {
    return this.activeSocketId !== "";
}

Client.prototype.hasSocket = function(socket) {
    return socket != null && this.sockets[socket.id] != null;
}

Client.prototype.getSocket = function(socketId) {
    return this.sockets[socketId];
}

Client.prototype.hasToken = function(token) {
    // todo, store next two tokens during validation phase only
    return this.authToken === token;
}

Client.prototype.setToken = function(token) {
    this.authToken = token;
}

Client.prototype.addSocket = function(socket) {
    if(this.hasSocket(socket)) return false; // no duplicate ids
    this.sockets[socket.id] = socket;
    if(Object.keys(this.sockets).length == 1) // it's the first guy in, useful for mobile where there's just one guy and no plans to call activate
        this.activeSocketId = socket.id;
    return true;
}

/** Triggered when user opens new socket on existing client
 * @param socket
 */
Client.prototype.handleNewSocket = function(socket) {
    this.addSocket(socket);    

    // if not yet authorized, make this socket the active socket
    if(!this.isAuthorized && this.activeSocketId != socket.id) {
        console.log("Info: Activating this socket since no socket on client is yet authorized: ", socket.id)
        this.activate(socket.id);
    }

    // if already authorized, return 'activeSessionError'
    if(this.isAuthorized) {
        socket.emit('otherActiveSession', '');
    }
    
}

Client.prototype.activate = function(socketId) {
    if(!this.getSocket(socketId)){
        console.log("Error: cannot activate non-existent socket: ", socketId)
        return false;
    }
    
    // make sure we're not trying to re-activate it
    if(this.activeSocketId == socketId) {
        console.log("Error: Trying to activate an already active socket: ", socketId)
        return;  
    }

    // tell the others sockets it's over
    this.socList().forEach(s => {
        if(s.id != socketId){
            console.log("Info: Emitting otherActiveSession and disconnecting socket: ", s.id);
            s.emit('otherActiveSession', '');
            s.disconnect();
        }
    })
    this.activeSocketId = socketId;
    return true;
}

Client.prototype.emit = function(event, message) {
    if(this.hasActiveSocket())
        return this.getSocket(this.activeSocketId).emit(event, message);
}

module.exports = Client;