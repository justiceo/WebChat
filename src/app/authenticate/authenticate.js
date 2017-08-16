
import Fingerprint2 from 'fingerprintjs2';
import EVENTS from '../../server/events';

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
            this.init(SocketService.io);
        }
    }

    init(socket) {
        this.socket = socket;
        this.registerListeners();
        new Fingerprint2().get((result, components) => {
            this.state = 'loadedQRCode';
            this.$window.deviceId = result;
            this.socket.emit(EVENTS.TOKEN_REQUEST, result);
        })
        
    }

    cache(key,value) {
        if(value !== undefined)
            this.storage.setItem(key, JSON.stringify(value));
        else
            return JSON.parse(this.storage.getItem(key));
    }

    registerListeners() {
        this.socket.on(EVENTS.TOKEN, res => {this.handle(this.onToken, res)});        
        this.socket.on(EVENTS.ROOM_AUTHED,res => {this.handle(this.onRoomAuthed, res)});
        this.socket.on(EVENTS.OTHER_SESSION, res => {this.handle(this.onOtherActiveSession, res)});

        // test auth
        this.socket.on(EVENTS.TEST_AUTH_PASS, mesage => console.log(mesage));
        this.socket.on(EVENTS.TEST_AUTH_FAIL, mesage => console.error(mesage));
        this.socket.emit(EVENTS.TEST_AUTH, 'This request should fail');
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
                    this.socket.emit(EVENTS.TOKEN_REFRESH, token); 
            }, 8000);
        }); 
    }

    onRoomAuthed(data) {
        this.cache('roomInfo', data);
        this.socket.join(data.roomId);
        this.authed = true;
        this.state = EVENTS.ROOM_AUTHED;
        this.socket.emit('latestDataRequest', Date.now - 10000);
    }

    onOtherActiveSession(otherSession) {
        this.state = EVENTS.OTHER_SESSION;
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
        state: '='
    }
}

export default Authenticate;