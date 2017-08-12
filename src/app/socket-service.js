export default class SocketService {
    constructor() {
        this.io = io.connect('http://localhost:4000');
        this.io.on('connection', () => {
            this.io
                .emit('authenticate', { token: "jwt" }) //send the jwt
                .on('authenticated', (data) => {
                    conosle.log("authenticated", data)
                })
                .on('unauthorized', (msg) => {
                    console.log("unauthorized: " + JSON.stringify(msg.data));
                    throw new Error(msg.data.type);
                })
        });
        console.log("initing socket")
    }
}