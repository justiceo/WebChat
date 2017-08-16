export default class SocketService {
    constructor() {
        if(typeof(io) == 'undefined') {
            this.error = "Cannot connect to chat server";
            return;
        }
        this.io = io.connect(window.location.origin);
        this.io.on('connection', (socket) => {            
            this.socket = socket;
        });        
        console.log("initing socket")
    }
}
