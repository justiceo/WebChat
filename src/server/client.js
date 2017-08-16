
/** Creates a new Client object
 * @contructor
 * @param {*} clientId 
 * @param {*} socket 
 * @param {*} authToken 
 */
function Client(clientId, socket, authToken, isMobile) {
    this.TAG            = "Client: ";
    this.id             = clientId;
    this.sockets        = [socket];
    this.authToken      = authToken;
    this.activeSocketId = "";
    this.isMobile       = isMobile;
}

/** Disconnects the given the socket, and if no socket given, disconnect itself
 * @param {*} socket
 */
Client.prototype.disconnect = function(socket) {
    if(this.hasSocket(socket)) {
        this.log("disconnecting " + socket.id);
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

Client.prototype.isActive = function() {
    return this.activeSocketId !== "";
}

Client.prototype.hasSocket = function(socket) {
    return socket != null && this.getSocket(socket.id) != null;
}

Client.prototype.getSocket = function(socketId) {
    return this.sockets.find(s => s.id === socketId);
}

Client.prototype.addSocket = function(socket) {
    if(this.hasSocket(socket)) return false; // no duplicate ids
    this.sockets.push(socket);
    if(this.sockets.length == 1) // it's the first guy in
        this.activeSocketId = socket.id;
    return true;
}

Client.prototype.activate = function(socketId) {
    if(!this.getSocket(socketId)) return false;
    
    // make sure we're not trying to re-activate it
    if(this.activeSocketId === socketId) return;

    // if it's not active, just set it
    if(!this.isActive()) {
        this.activeSocketId = socketId;
        return true;
    }

    // tell the current socket it's over
    let currentActive = this.getSocket(this.activeSocketId);
    currentActive.emit('otherSession', '');
    currentActive.disconnect();
    this.activeSocketId = socketId;
    return true;
}

Client.prototype.emit = function(event, message) {
    if(isActive())
        return this.getSocket(this.activeSocketId).emit(event, message);
}

module.exports = Client;