var Client = require('./client');
var EVENTS = require('./events');

function ClientManager(db) {
    this.db                 = db;
    this.TAG                = "ClientManager: ";
}

/** Creates a client if it doesn't exist and returns an auth token for the socket
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
            this.db.exists(clientId+"-authed", (err2, authed) => {
                if(authed) {
                    callback(EVENTS.OTHER_SESSION, null);
                }
                else {
                    callback(null, this.acquireLock(clientId, socket));
                }                
            });
        }
        else{            
            callback(null, this.acquireLock(clientId, socket));
        }
    });        
}

// returns a promise
ClientManager.prototype.refresh = function(oldToken, socket, callback) {
    // check if this socket is active socket

    let clientId = this.extractClientId(oldToken);

    this.db.get(clientId, (err0, lock) => {
        if(err0 !== null || !lock) return callback(EVENTS.REFRESH_FAIL, null);
        if(lock !== socket.id) {
            console.log("Info: ", socket.name, " - lock: ", lock);
            return callback(EVENTS.OTHER_SESSION, null);
        }

        this.db.exists(clientId+"-token", (err, tokenExist) => {
            if(err) {
                callback(err, null);
                return;
            }

            if(tokenExist === 1)
                callback(null, this.makeToken(clientId));
            else
                callback(EVENTS.REFRESH_FAIL, null);
        });
    });

    
}

ClientManager.prototype.disconnect = function(socket) {
    this.db.get(socket.id, (err, token) => {
        if(err) {
            console.error(this.TAG, err);
            return;
        }
        
        if(!token) return;
        let client = this.extractClientId(token);
        console.log(this.TAG, "Disconnecting socket: ", socket.id, "on client: ", client);
        this.hasLock(client, socket.id, (err, hasLock) => {
            if(hasLock)
                this.relinquishLock(client);                 
        });
    })
}

ClientManager.prototype.makeToken = function(tokenIdentifier) {
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    token += Date.now() + "--" + tokenIdentifier;
    this.db.set(tokenIdentifier+"-token", token);
    //this.db.expire(tokenIdentifier+"-token", 500); // expires in 500 seconds, todo: find optimal time
    return token;
}

ClientManager.prototype.acquireLock = function(clientId, socket) {
    let token = this.makeToken(clientId);
    // give this socket the lock
    this.db.get(clientId, (err, lock) => {        
        if(lock) {
            socket.to(lock).emit(EVENTS.OTHER_SESSION);
        }
        this.db.set(clientId, socket.id);
        this.db.expire(clientId, 500);
        // save the socket's token
        this.db.set(socket.id, token);
        this.db.expire(socket.id, 500);
    });    
    return token;
}

/**
 * Checks if socket has the lock of a client
 */
ClientManager.prototype.hasLock = function(clientId, socketId, callback) {
    this.db.get(clientId, (err, lock) => {
        if(err !== null) return callback(err, null);        
        callback(null, lock === socketId);
    });
}

ClientManager.prototype.relinquishLock = function(clientId) {
    console.log(this.TAG, "Relinquishing lock on client: ", clientId);
    this.db.del(clientId, (err, ok) => {
        if(err) console.error(this.TAG, err);
    })
}

ClientManager.prototype.extractClientId = function(authToken) {
    return authToken.substring(authToken.lastIndexOf('--') + 2);
}

ClientManager.prototype.extractToken = function(authToken) {
    return authToken.substring(0, authToken.lastIndexOf('--'));
}

ClientManager.prototype.isValidToken = function(socket, token, callback) {
    if(!token){
        callback(null, false);
    }

    this.db.get(socket.id, (err, savedToken) => {
        if(err)
            return callback(err, null);
        else
            return callback(null, savedToken === token);
    })
}

ClientManager.prototype.pair = function(mSocket, mClientId, qrcode, callback) {
    let client = this.extractClientId(qrcode);
    this.db.set("authed-"+mClientId, client, (err, ok) => {
        callback(err, err === null ? client : null);
    });

}

ClientManager.prototype.authorize = function(webClient, phoneClient) {
    // todo: ensure webClient exists and that roomId is the socket.id of a mobile client
    webClient.roomId = phoneClient.activeSocketId;
    phoneClient.roomId = phoneClient.activeSocketId;

    // web client only has the socket id but hasn't joined it yet
    // todo: ask it to join? or handle it?
}

module.exports = ClientManager;