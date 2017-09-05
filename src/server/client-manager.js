var Client = require('./client');

function ClientManager(db) {
    this.db                 = db;
    this.TAG                = "ClientManager: ";
}

/** Creates a client if it doesn't exist 
 * @param {*} clientId
 * @param {*} socket
 */
ClientManager.prototype.create = function(clientId, socket, callback) {
    this.db.exists(clientId, (err, exist) => { 
        if(err) {
            callback(err, null);
            return;
        }

        if(exist === 1) {
            // todo: check if authed too
            callback("Other active session", true);
        }
        else{
            this.db.set(clientId, socket.id);
            callback(null, true);
        }
    });        
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
    return this.db.hgetall(this.R_CLIENTS, (err, clients) => {
        if(clients[clientId])
            return clients[clientId];
        return false;
    });
}

ClientManager.prototype.extractClientId = function(authToken) {
    return authToken.substring(authToken.lastIndexOf('--'));
}

ClientManager.prototype.extractToken = function(authToken) {
    return authToken.substring(0, authToken.lastIndexOf('--'));
}

ClientManager.prototype.getClientBySocket = function(socket) {
    return this.db.exists(socket.id, (err, hasSocket) => {
        if(hasSocket === 1) {
            return this.db.get(socket.id, (err2, authToken)=> {
                return err === null ? 
                    this.extractClientId(authToken) : null;
            })
        }
        else return null;
    });
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