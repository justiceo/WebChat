var Client = require('./client');
function ClientManager(db) {
    this.db                 = db;
    this.TAG                = "ClientManager: ";
    this.clients            = [];
    console.log(this.TAG, "initialized...");

    // db constants
    this.R_TOKENS   = "AuthTokens"; // list of tokens issued
    this.R_CLIENTS  = "Clients";    // client ids and their info
    this.R_CSOCKETS = "ClientSockets";  // client ids and their sockets


}

/** Creates a client if it doesn't exist 
 * @param {*} clientId
 * @param {*} socket
 */
ClientManager.prototype.create = function(clientId, socket) {
    let isMobile = clientId.endsWith("elibom");
    // if this client currently exists
    let client = this.getClientById(clientId); // todo: parse this result
    if(client == null) {// there can only be one client with this id
        client = new Client(clientId, this.makeToken(clientId), isMobile);
        client.addSocket(socket);
        this.clients.push(client);
    }
    else {// inform this socket that there's a new connectoin
        client.handleNewSocket(socket);
    }
    
    return client;
}

ClientManager.prototype.makeToken = function(tokenIdentifier) {
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    token += Date.now() + "--" + tokenIdentifier;
    this.db.set(tokenIdentifier+"-token", token);
    this.db.expire(tokenIdentifier+"-token", 500); // expires in 500 seconds
    return token;
}

// returns a promise
ClientManager.prototype.refresh = function(oldToken) {
    let tokenIdentifier = oldToken.substring(0, oldToken.lastIndexOf("--"));
    return this.db.exists(tokenIdentifier+"-token", (err, reply) => {
        if(reply === 1)
            return this.makeToken(tokenIdentifier);
        else
            return false;
    });
}

ClientManager.prototype.getClientById = function(clientId) {
    return this.db.hgetAll(this.R_CLIENTS, (err, clients) => {
        if(clients[clientId])
            return clients[clientId];
        return false;
    });
}

ClientManager.prototype.getClientByAuthToken = function(token) {
    return token.substring(token.lastIndexOf('--'));
}

ClientManager.prototype.getClientBySocket = function(socket) {
    return this.clients.find(c => c.hasSocket(socket));
}

ClientManager.prototype.authorize = function(webClient, phoneClient) {
    // todo: ensure webClient exists and that roomId is the socket.id of a mobile client
    webClient.roomId = phoneClient.activeSocketId;
    phoneClient.roomId = phoneClient.activeSocketId;

    // web client only has the socket id but hasn't joined it yet
    // todo: ask it to join? or handle it?
}

ClientManager.prototype.disconnectStale = function() {
    this.clients.forEach(c => {
        if(!c.isActive())
            c.disconnect();
    });
}

module.exports = ClientManager;