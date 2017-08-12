export class AuthCtrl {
    constructor($timeout,SocketService) {
        this.$timeout = $timeout;
        this.socket = SocketService;
        this.registerListeners();
        this.updateQRCode(); 
    }

    registerListeners() {
        // listeners for authentication  
        this.socket.io.on('token', (data) => {
            console.log("recieved token", data);
        });

        this.socket.io.on('authed', (data) => {
        });    
        this.socket.io.on('deauthed', (data) => {
        });      
        this.socket.io.on('tooFar', (data) => {
        }); 
        this.socket.io.on('closeBy', (data) => {
        });
    }

    updateQRCode() {
        // refresh the code every 8 secs
        if(!this.authed)            
            this.$timeout(() => {return this.updateQRCode()}, 8000)
        // request new id from server and update code
        this.socket.io.emit('tokenRequest', 'some data to request');
        window.QRCode.toDataURL(this.makeid(), (err, url) => {
            this.imgUrl = url;
        });
    }

    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 100; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}

let Authenticate = {
    templateUrl: 'app/authenticate/authenticate.html',
    controller: AuthCtrl
}

export default Authenticate;