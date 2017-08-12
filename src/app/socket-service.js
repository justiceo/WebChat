export default class SocketService {
    constructor() {
        this.io = io.connect('http://localhost:4000');
        console.log("initing socket")
    }
}