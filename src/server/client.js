
/** Creates a new Client object
 * @contructor
 * @param {*} clientId 
 * @param {*} socket 
 * @param {*} authToken 
 */
function Client(clientId, authToken, isMobile) {
    this.TAG            = "Client: ";
    this.id             = clientId;
    this.sockets        = [];
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

    this.log("deactivating client " + this.id);
    this.sockets.forEach(s => s.disconnect());
    this.activeSocketId = "";
}

Client.prototype.sign = function(message) {
    // todo: implement on client-side
}

Client.prototype.hasActiveSocket = function() {
    return this.activeSocketId !== "";
}

Client.prototype.hasSocket = function(socket) {
    return socket != null && this.getSocket(socket.id) != null;
}

Client.prototype.getSocket = function(socketId) {
    return this.sockets.find(s => s.id === socketId);
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
    this.sockets.push(socket);
    if(this.sockets.length == 1) // it's the first guy in, useful for mobile where there's just one guy and no plans to call activate
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
        this.activate(socket.id);
    }

    // if already authorized, return 'activeSessionError'
    if(this.isAuthorized) {
        socket.emit('otherActiveSession', '');
    }
    
}

Client.prototype.activate = function(socketId) {
    if(!this.getSocket(socketId)) return false;
    
    // make sure we're not trying to re-activate it
    if(this.activeSocketId == socketId) return;  

    // tell the others sockets it's over
    this.sockets.forEach(s => {
        if(s.id != socketId){
            console.log("emitting otherActiveSession to: ", s.id);
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