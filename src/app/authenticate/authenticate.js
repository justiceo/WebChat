
import Fingerprint2 from 'fingerprintjs2';

export class AuthCtrl {
    constructor($timeout, $window, $scope, SocketService) {
        this.$timeout = $timeout;
        this.$window = $window;
        this.$scope = $scope;
        this.storage = window.sessionStorage;
        this.inactive = false;
        this.loadingQRCode = true;
        
        if(SocketService.error) {
            this.state = 'isErrored';
        }
        else{
            this.state = 'loading'
            this.init(SocketService.io);
        }
    }

    init(socket) {
        this.socket = socket;
        this.registerListeners();
        new Fingerprint2().get((result, components) => {
            this.state = 'loadedQRCode';
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
        this.socket.on('token', res => {this.handle(this.onToken, res)});        
        this.socket.on('roomAuthed',res => {this.handle(this.onRoomAuthed, res)});
        this.socket.on('otherActiveSession', res => {this.handle(this.onOtherActiveSession, res)});

        // test auth
        this.socket.on('testAuthPass', mesage => console.log(mesage));
        this.socket.on('testAuthFail', mesage => console.error(mesage));
        this.socket.emit('testAuth', 'This request should fail');
    }

    onToken(token) {
        this.cache('authToken', token);
        // uncomment to test if token is working
        // this.socket.emit('testAuth', this.sign('This request should pass'));
        this.$window.QRCode.toDataURL(token, (err, url) => {
            this.loadingQRCode = false;
            this.imgUrl = url;
            this.$scope.$apply();
            // refresh the code every 8 secs after qrcode is actually displayed
            this.$timeout(() => {
                if(!this.authed && !this.isErrored)
                    this.socket.emit('tokenRefresh', token); 
            }, 8000);
        }); 
    }

    onRoomAuthed(data) {
        this.cache('roomInfo', data);
        this.socket.join(data.roomId)
        this.authed = true;
        // reload ui
        // todo: check the last time data was fetch and fetch from there
        this.socket.emit('latestDataRequest', Date.now - 10000);
    }

    onOtherActiveSession(otherSession) {
        this.state = 'otherSession';
        this.$scope.$apply(); // notify angular about event outside it's watch
    }

    sign(message) {
        return {
            auth: { authToken: this.cache('authToken') },
            message: message
        }
    }

    handle(fn, args) {
        console.log('<-Event: ' + fn.name);
        this[fn.name](args);
        this.$scope.$apply();
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