export default class Handlers {
    constructor(clientManager) {
        this.TAG = "Handlers: ";
        this.clientManager = clientManager;
        console.log(this.TAG, "initializing...")
    }

    garnish(io) {
        io.on('connection', (socket) => {
            console.log("connected");
        })
    }
}