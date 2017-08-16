var Client = require('./client');
function ClientManager() {
    this.TAG                = "ClientManager: ";
    console.log(this.TAG, "initializing...");
    this.webClients         = [];
    this.activeWebClient    = null;
    this.mobileClient       = null;
}

/** Creates a client if it doesn't exist 
 * @param {*} clientId
 * @param {*} socket
 */
ClientManager.prototype.create = function(clientId, socket) {
    let isMobile = clientId.endsWith("elibom");
    // if this client currently exists
    let client = this.getClientById(clientId);
    if(client == null) {// there can only be one client with this id
        client = new Client(clientId, this.makeToken(), isMobile);
        client.addSocket(socket);
        this.webClients.push(client);
    }
    else {// inform this socket that there's a new connectoin
        client.handleNewSocket(socket);
    }
    
    if(this.webClients.length == 1)
        this.activeWebClient = client;
    return client;
}

ClientManager.prototype.makeToken = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    //return "Pi94BXqogmJlqyeEAAAA";
    // include-timestamp in tokens
    return text;
}

ClientManager.prototype.refresh = function(oldToken) {
    let client = this.webClients.find(c => c.hasToken(oldToken));
    if(client) {
        client.setToken(this.makeToken());
        return client.authToken;
    }
    return false;
}

ClientManager.prototype.getClientById = function(clientId) {
    return this.webClients.find(c => c.id === clientId);
}

ClientManager.prototype.getClientBySocket = function(socket) {
    return this.webClients.find(c => c.hasSocket(socket));
}

ClientManager.prototype.disconnectStale = function() {
    this.webClients.forEach(c => {
        if(!c.isActive())
            c.disconnect();
    });
}

module.exports = ClientManager;