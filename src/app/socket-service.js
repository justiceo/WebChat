export default class SocketService {
    constructor() {
        if(typeof(io) == 'undefined') {
            console.error('SocketService: socket.io not loaded');
            return;
        }
        this.io = io.connect(window.location.origin, {
            'reconnectionAttempts': 10,
            'reconnectionDelay': 3000
        });
        this.io.on('connection', (socket) => {            
            this.socket = socket;
        });        
        console.log("initing socket")
    }
}
