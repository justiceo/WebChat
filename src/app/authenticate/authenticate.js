export class AuthCtrl {
    constructor($timeout, $window, SocketService) {
        this.$timeout = $timeout;
        this.storage = window.sessionStorage;
        this.init(SocketService.io);
    }

    init(socket) {
        this.socket = socket;
        this.registerListeners();
        this.updateQRCode();
    }

    cache(key,value) {
        if(value !== undefined)
            this.storage.setItem(key, JSON.stringify(value));
        else
            return JSON.parse(this.storage.getItem(key));
    }

    registerListeners() {
        // listeners for authentication  
        this.socket.on('token', (token) => {
            console.log('recieved new token: ', token);
            this.cache('authToken', token);
            window.QRCode.toDataURL(token, (err, url) => {
                this.imgUrl = url;
            });            
        });

        // test auth
        this.socket.emit('testAuth', 'This request should fail');
        this.socket.on('testAuthSuccess', mesage => console.log(mesage));
        this.socket.on('testAuthFail', mesage => console.log(mesage));
        this.$timeout(() => {
            let data = {
                auth: { authToken: this.cache('authToken') },
                message: 'This request should pass'
            }
            this.socket.emit('testAuth', data)
        }, 2000);
        
        // connected to room, start loading data
        this.socket.on('roomAuthed', (data) => {
            console.log("authed!", data);
            this.cache('roomInfo', data);
            this.socket.join(data.roomId)
            this.authed = true;
            // reload ui
            // todo: check the last time data was fetch and fetch from there
            this.socket.emit('latestDataRequest', Date.now - 10000);
        });
    }

    updateQRCode() {
        // refresh the code every 8 secs
        if (!this.authed)
            this.$timeout(() => { return this.updateQRCode() }, 8000)
        // request new id from server and update code
        this.socket.emit('tokenRequest', window.deviceId);
    }
}

let Authenticate = {
    templateUrl: 'app/authenticate/authenticate.html',
    controller: AuthCtrl
}

export default Authenticate;