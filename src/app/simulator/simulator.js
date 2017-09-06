
import EVENTS       from '../../server/events';

export class SimulatorCtrl {
    constructor($scope, SocketService) {
        console.log("started simulator");
        this.$scope = $scope;
        if(!SocketService.io) {
            console.error("SimulCtrl: socket.io not loaded");
        }
        else{
            this.init(SocketService.io);
        }
    }

    init(socket) {
        this.socket = socket;
        socket.on('connect', (data) => {
            console.log("emulator: connected to server");
            // request token
            socket.emit(EVENTS.TOKEN_REQUEST, "web-emulator");

            // receive token, wait a moment and send validation request
            socket.on(EVENTS.TOKEN, (authToken) => {                
                console.log("emulator: recieved token", authToken)
                this.authToken = authToken;  
                console.log("authtoken set to: ", this.authToken); 
                console.log("this is:", this);            
                this.$scope.$apply();

                socket.on(EVENTS.CONV_REQUEST, (req) => {
                    socket.emit(EVENTS.CONV_DATA, {
                        auth: { authToken: authToken },
                        message: [
                            {
                                "text": "hello world",
                                "sender": "Nelson Mandela"
                            }
                        ]
                    })
                })
            });

        });
    }

    sign(message) {
        return {
            auth: { 'authToken': "" + this.authToken },
            message: message
        }
    }

    submitCode() {
        console.log("submitting ", this.qrcode, this.authToken);
        this.socket.emit(EVENTS.TOKEN_VALIDATE, this.sign(this.qrcode));
    }
}

let Simulator = {
    templateUrl: 'app/simulator/simulator.html',
    controller: SimulatorCtrl
}

export default Simulator;