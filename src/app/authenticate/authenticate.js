
import Fingerprint2 from 'fingerprintjs2';
import EVENTS       from '../../server/events';

export class AuthCtrl {
    constructor($timeout, $window, $scope, SocketService) {
        this.$timeout = $timeout;
        this.$window = $window;
        this.$scope = $scope;
        this.storage = $window.sessionStorage;
        this.inactive = false;
        this.loadingQRCode = true;
        
        if(!SocketService.io) {
            console.error("AuthCtrl: socket.io not loaded");
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
            // using volatile means the connection doesn't have to succeed
            // to prevent spamming the server with stale requests on-resume
            // problem is how do we then resume?
            this.socket.emit(EVENTS.TOKEN_REQUEST, result);
        })
        
    }

    registerListeners() {
        this.socket.on(EVENTS.CONNECT_ERROR,    res => {this.unhandledEvent(EVENTS.CONNECT_ERROR, res)});
        this.socket.on(EVENTS.CONNECT_TIMEOUT,  res => {this.unhandledEvent(EVENTS.CONNECT_TIMEOUT, res)});
        this.socket.on(EVENTS.DISCONNECT,       res => {this.handle(this.onDisconnect, res)});
        this.socket.on(EVENTS.ERROR,            res => {this.handle(this.onError, res)});
        this.socket.on(EVENTS.RECONNECT,        res => {this.unhandledEvent(EVENTS.RECONNECT, res)});
        this.socket.on(EVENTS.RECONNECT_ATTEMPT,res => {this.unhandledEvent(EVENTS.RECONNECT_ATTEMPT, res)});
        this.socket.on(EVENTS.RECONNECT_ERROR,  res => {this.unhandledEvent(EVENTS.RECONNECT_ERROR, res)});
        this.socket.on(EVENTS.RECONNECT_FAILED, res => {this.unhandledEvent(EVENTS.RECONNECT_FAILED, res)});
        this.socket.on(EVENTS.RECONNECTING,     res => {this.unhandledEvent(EVENTS.RECONNECTING, res)});

        this.socket.on(EVENTS.TOKEN,            res => {this.handle(this.onToken, res)});
        this.socket.on(EVENTS.REFRESH_FAIL,     res => {this.handle(this.onRefreshFail, res)});        
        this.socket.on(EVENTS.ROOM_AUTHED,      res => {this.handle(this.onRoomAuthed, res)});
        this.socket.on(EVENTS.OTHER_SESSION,    res => {this.handle(this.onOtherActiveSession, res)});

        // test auth
        this.socket.on(EVENTS.TEST_AUTH_PASS, mesage => console.log(mesage));
        this.socket.on(EVENTS.TEST_AUTH_FAIL, mesage => console.error(mesage));
        this.socket.emit(EVENTS.TEST_AUTH, 'This request should fail');
    }

    unregisterListeners() {
        // todo implement
    }

    onDisconnect(reason) {
        this.unregisterListeners();
    }
    
    onError(error) {
        console.error(error);
    }

    onToken(token) {
        this.cache('authToken', token);
        // uncomment to test if token is working
        // this.socket.emit('testAuth', this.sign('This request should pass'));
        this.$window.QRCode.toDataURL(token, (err, url) => {
            this.loadingQRCode = false;
            this.state = "loadedQrCode"
            this.imgUrl = url;
            this.$scope.$apply();
            // refresh the code every 8 secs after qrcode is actually displayed
            this.$timeout(() => {
                if(this.state != EVENTS.ROOM_AUTHED && this.state != 'isErrored')
                    this.socket.emit(EVENTS.TOKEN_REFRESH, token); 
            }, 15000);
        }); 
    }

    onRefreshFail() {
        this.socket.emit(EVENTS.TOKEN_REQUEST, this.$window.deviceId);
    }

    onRoomAuthed(data) {
        this.cache('roomInfo', data);
        this.authed = true;
        this.state = EVENTS.ROOM_AUTHED;
    }

    onOtherActiveSession(otherSession) {
        this.unregisterListeners();
        this.state = EVENTS.OTHER_SESSION;
    }

    activateHere() {
        console.log("active here");
        this.socket.disconnect();
        this.socket.connect();
        this.socket.emit(EVENTS.TOKEN_REQUEST, this.$window.deviceId);
    }
    reload() {        
        window.location.reload();
    }

    handle(fn, args) {
        console.log('<-Event: ' + fn.name);
        this[fn.name](args);
        this.$scope.$apply();
    }

    unhandledEvent(eventName, args) {
        let str = typeof(args) == 'object' ? '[object]' : args;
        console.log("<-Unhandled Event: " + eventName + ", ", str);
    }

    cache(key,value) {
        if(value !== undefined)
            this.storage.setItem(key, JSON.stringify(value));
        else
            return JSON.parse(this.storage.getItem(key));
    }

    sign(message) {
        return {
            auth: { authToken: this.cache('authToken') },
            message: message
        }
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