
import Typed from 'typed.js';
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
        this.socket = SocketService.io;
    }

    $onInit() {
        if(!this.socket) {
            console.error("AuthCtrl: socket.io not loaded");
            this.state = 'isErrored';
        }
        else if(this.cache("hostId")) {
            this.authed = true;
            this.state = EVENTS.ROOM_AUTHED;
        }
        else{
            this.init(this.socket);
        }     
        

        var options = {
            strings: [ "",  
            'What if your SMS app was... ^300 a little <b>magical</b>? ^500In a good sense :)',
            "What if your SMS app could send <b>encryped</b> messages? ^2000 hmm",
            "What if your SMS app could be used on the <b>browser</b>? ^500... ^500You could look more serious in the office :) ^500",
            "What if your SMS app could send super-loooong messages without breaking it up? ^500Like 1/4, ^200 2/4 ^500 somehow 4/4 comes before 3/4",
            "What if your SMS app could send messages that <b>auto-deletes</b> itself? ^1000Like seriously?! ^500 Yep! ^100", 
            'What if your SMS app could auto-magically archive spam, marketers and verification codes (after you\'ve seen them)? ^1500You\'ll have a beautiful inbox',
            'What if your SMS app has a <b>night mode</b> that is both intelligent and customizeable? ^1000',
            'What if your SMS app makes <b>Multi-sim</b> texting a bliss?',
            'What if your SMS app could save you tons of <b>Prepaid credit/minutes</b> by routing through internet? ^1000 Now, someone is talking :) ^500',
            'What if your SMS app could show you the contacts you have <b>texted the most</b> ever? ^500With some other cool stats?',
            'What if your SMS app could lift the <b>MMS size limit?</b> ^1000 You would not need Whatsapp or Email for big files again! ^200',
            'What if your SMS app could ... ^500Hold on. ^1000Hi dude/dudette, the blue "Upgrade me" button below is actually waiting for you :) ^2000 you may click it now. ^10000Looks like someone is not convinced yet.',
            'What if your SMS app could ^200 [cough] [cough] ^200 make lunch for you... everyday? ^2000But on a serious note,',
            "What if your SMS app was ^200 . ^200 . ^200 . ^500 truly <b>magical</b>?",
            ],
            typeSpeed: 40,
            startDelay: 2000,
            backDelay: 2000,
            smartBackspace: true,
            showCursor: false,
        }
        let typed = new Typed(".conviction", options);
    }
            

    init(socket) {
        this.socket = socket;
        this.registerListeners();
        new Fingerprint2().get((deviceFingerPrint, components) => {
            this.state = 'loadedQRCode';
            this.cache("deviceId", deviceFingerPrint);
            // using volatile means the connection doesn't have to succeed
            // to prevent spamming the server with stale requests on-resume
            // problem is how do we then resume?
            this.trigger(EVENTS.TOKEN_REQUEST, deviceFingerPrint);
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

        this.socket.on(EVENTS.AUTH_ERROR,       res => {this.unhandledEvent(EVENTS.AUTH_ERROR, res)});

        // test auth
        this.socket.on(EVENTS.TEST_AUTH_PASS, mesage => console.log(mesage));
        this.socket.on(EVENTS.TEST_AUTH_FAIL, mesage => console.error(mesage));
        this.trigger(EVENTS.TEST_AUTH, 'This request should fail');
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
        // uncomment to test if token is working
        // this.trigger('testAuth', this.sign('This request should pass'));
        this.$window.QRCode.toDataURL(token, (err, url) => {
            this.loadingQRCode = false;
            this.state = "loadedQrCode"
            this.imgUrl = url;
            this.$scope.$apply();
            // refresh the code every 8 secs after qrcode is actually displayed
            this.$timeout(() => {
                if(this.state != EVENTS.ROOM_AUTHED && this.state != 'isErrored')
                    this.trigger(EVENTS.TOKEN_REFRESH, token); 
            }, 15000);
        });
        this.cache('authToken', token); 
    }

    onRefreshFail() {
        this.trigger(EVENTS.TOKEN_REQUEST, this.cache("deviceId"));
    }

    onRoomAuthed(data) {
        this.cache('hostId', data);
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
        this.trigger(EVENTS.TOKEN_REQUEST, this.cache("deviceId"));
    }
    reload() {        
        window.location.reload();
    }

    handle(fn, args) {
        let str = typeof(args) == 'object' ? '[object]' : args;
        console.log('<-Event: ' + fn.name + ", ", str);
        this[fn.name](args);
        this.$scope.$apply();
    }

    unhandledEvent(eventName, args) {
        let str = typeof(args) == 'object' ? '[object]' : args;
        console.log("<-Unhandled Event: " + eventName + ", ", str);
    }

    trigger(event, args) {
        let str = typeof(args) == 'object' ? '[object]' : args;
        console.log("->Triggering: " + event + ", ", str);
        this.socket.emit(event, args);
    }

    cache(key,value) {
        if(value !== undefined)
            this.storage.setItem(key, JSON.stringify(value));
        else
            return JSON.parse(this.storage.getItem(key));
    }

    sign(message) {
        return {
            auth: { 
                authToken: this.cache('authToken'),
            },
            hostId: this.cache('hostId'),
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