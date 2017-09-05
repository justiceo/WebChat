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
        var authToken = "";
        socket.on('connect', function (data) {
            console.log("emulator: connected to server");
            // request token
            socket.emit('tokenRequest', window.deviceId + "-emulator");

            // receive token, wait a moment and send validation request
            socket.on('token', (tk) => {
                console.log("emulator: recieved token", tk)
                authToken = tk;
                setTimeout(() => {
                    socket.emit('tokenValidate', {
                        auth: { authToken: authToken },
                        message: "Pi94BXqogmJlqyeEAAAA"
                    });
                }, 2000);

                socket.on('latestDataRequest', (req) => {
                    socket.emit('latestConversations', {
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
    }
}

let Simulator = {
    templateUrl: 'app/simulator/simulator.html',
    controller: SimulatorCtrl
}

export default Simulator;