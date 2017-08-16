var Client = require('./client');
function ClientManager() {
    this.TAG                = "ClientManager: ";
    console.log(this.TAG, "initializing...");
    this.webClients         = [];
    this.activeWebClient    = null;
    this.mobileClient       = null;
}

ClientManager.prototype.create = function(clientId, socket) {
    let isMobile = clientId.endsWith("elibom");
    let client = new Client(clientId, this.makeToken(), isMobile);
    client.addSocket(socket);
    this.webClients.push(client);
    if(this.webClients.length == 1)
        this.activeWebClient = client;
    return client;
}

ClientManager.prototype.makeToken = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return "Pi94BXqogmJlqyeEAAAA";
    //return text;
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