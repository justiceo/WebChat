export default class SocketService {
    constructor() {
        this.io = io.connect('http://localhost:4000');
        this.io.on('connection', (socket) => {            
            this.socket = socket;
        });        
        console.log("initing socket")
    }
}