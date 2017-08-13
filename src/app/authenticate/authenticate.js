export class AuthCtrl {
    constructor($timeout, SocketService) {
        this.$timeout = $timeout;
        this.socket = SocketService;
        this.registerListeners();
        this.updateQRCode();
    }

    registerListeners() {
        // listeners for authentication  
        this.socket.io.on('token', (token) => {
            console.log('recieved new token: ', token)
            window.QRCode.toDataURL(token, (err, url) => {
                this.imgUrl = url;
            });
        });

        this.socket.io.on('authed', (data) => {
            this.authed = true;
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
        if (!this.authed)
            this.$timeout(() => { return this.updateQRCode() }, 8000)
        // request new id from server and update code
        this.socket.io.emit('tokenRequest', window.deviceId);

    }
}

let Authenticate = {
    templateUrl: 'app/authenticate/authenticate.html',
    controller: AuthCtrl
}

export default Authenticate;