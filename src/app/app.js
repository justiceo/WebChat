import EVENTS from '../server/events';
export class AppCtrl {
    constructor() {
        this.state = "testing";
        this.EVENTS = EVENTS;
    }
}

let App = {
    template: `
    <div class="wrapper" ng-switch="$ctrl.state">
        <authenticate state="$ctrl.state" ng-switch-default"></authenticate>
        <conversations ng-switch-when="{{ $ctrl.EVENTS.ROOM_AUTH }}"></conversations>
        <p ng-switch-when="{{ $ctrl.EVENTS.INVALID_CLIENT }}"></p>
    </div>
    `,
    controller: AppCtrl
}

export default App;