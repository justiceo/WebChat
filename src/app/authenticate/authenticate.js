
import Fingerprint2 from 'fingerprintjs2';

export class AuthCtrl {
    constructor($timeout, $window, SocketService) {
        this.$timeout = $timeout;
        this.$window = $window;
        this.storage = window.sessionStorage;
        this.init(SocketService.io);
        this.inactive = false;
        this.otherSessionActive = false;
    }

    init(socket) {
        this.socket = socket;
        this.registerListeners();
        new Fingerprint2().get((result, components) => {
            this.$window.deviceId = result;
            this.socket.emit('tokenRequest', result);
        })
        
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
            
            // refresh the code every 8 secs
            this.$timeout(() => {
                if(!this.authed && !this.otherSessionActive)
                    this.socket.emit('tokenRefresh', token); 
            }, 8000)
                
        });

        // test auth
        this.socket.emit('testAuth', 'This request should fail');
        this.socket.on('testAuthPass', mesage => console.log(mesage));
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

        this.socket.on('otherActiveSession', (otherSession) => {
            this.otherSessionActive = true;
            console.log("other session is active: ", otherSession);
        })
    }
}

let Authenticate = {
    templateUrl: 'app/authenticate/authenticate.html',
    controller: AuthCtrl,
    bindings: {
        authState: '='
    }
}

export default Authenticate;