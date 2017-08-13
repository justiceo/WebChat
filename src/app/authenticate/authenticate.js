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
            console.log('recieved new token: ', token);
            // todo: put token in localstorage
            //this.token = token;
            window.QRCode.toDataURL(token, (err, url) => {
                this.imgUrl = url;
            });
        });

        this.socket.io.on('authed', (data) => {
            console.log("authed!", data);
            //this.authed = true;
            this.phoneId = data.phone; //data should contain room info
            // todo: check the last time data was fetch and fetch from there
            this.socket.io.emit('latestDataRequest', Date.now - 10000);
        });
        this.socket.io.on('deauthed', (data) => {
            this.authed = false;
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