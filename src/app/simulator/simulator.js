
import EVENTS       from '../../server/events';

export class SimulatorCtrl {
    constructor($scope, $window, SocketService) {
        console.log("started simulator");
        this.$scope = $scope;
        this.storage = $window.sessionStorage;
        if(!SocketService.io) {
            console.error("SimulCtrl: socket.io not loaded");
        }
        else{
            this.init(SocketService.io);
        }
    }

    init(socket) {
        this.socket = socket;
        
        // register handlers
        socket.on('connect', (data) => {
            console.log("emulator: connected to server");
            // request token
            socket.emit(EVENTS.TOKEN_REQUEST, "web-emulator");
        });
        
        socket.on(EVENTS.TOKEN, (authToken) => {                
            console.log("emulator: recieved token", authToken)
            this.authToken = authToken;           
            this.$scope.$apply();
        });

        socket.on(EVENTS.CONV_REQUEST, (req) => {
            console.log("recieved conv request", req);
            socket.emit(EVENTS.CONV_DATA, this.sign("hello world"))
        });
    }

    sign(message) {
        console.log("clientid:", this.cache('clientId'));
        return {
            auth: { 'authToken': "" + this.authToken },
            clientId: this.cache("clientId"),
            message: message
        }
    }

    submitCode() {
        console.log("submitting ", this.qrcode, this.authToken);
        let clientId = this.extractClientId(this.qrcode);
        this.cache('clientId', clientId);
        this.socket.emit(EVENTS.TOKEN_VALIDATE, this.sign(this.qrcode));
    }
    cache(key,value) {
      if(value !== undefined)
          this.storage.setItem(key, JSON.stringify(value));
      else
          return JSON.parse(this.storage.getItem(key));
    }

    extractClientId(authToken) {
        return authToken.substring(authToken.lastIndexOf('--') + 2);
    }
}

let Simulator = {
    templateUrl: 'app/simulator/simulator.html',
    controller: SimulatorCtrl
}

export default Simulator;