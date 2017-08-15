export default class SocketService {
    constructor() {
        this.io = io.connect(window.location.origin);
        this.io.on('connection', (socket) => {            
            this.socket = socket;
        });        
        console.log("initing socket")
    }
}
