export class SimulatorCtrl {
    constructor() {
        console.log("started simulator");
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