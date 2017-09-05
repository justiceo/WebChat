
import EVENTS       from '../../server/events';

export class SimulatorCtrl {
    constructor(SocketService) {
        console.log("started simulator");
        if(!SocketService.io) {
            console.error("SimulCtrl: socket.io not loaded");
        }
        else{
            this.init(SocketService.io);
        }
    }

    init(socket) {
        this.socket = socket;
        socket.on('connect', function (data) {
            console.log("emulator: connected to server");
            // request token
            socket.emit(EVENTS.TOKEN_REQUEST, "web-emulator");

            // receive token, wait a moment and send validation request
            socket.on(EVENTS.TOKEN, (authToken) => {                
                console.log("emulator: recieved token", authToken)
                this.authToken = authToken;               

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

    submitCode() {
        console.log("submitting ", this.qrcode);
        this.socket.emit(EVENTS.TOKEN_VALIDATE, {
            auth: { authToken: this.authToken },
            message: this.qrcode
        });
    }
}

let Simulator = {
    templateUrl: 'app/simulator/simulator.html',
    controller: SimulatorCtrl
}

export default Simulator;