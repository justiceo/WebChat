
export class AppCtrl {
    constructor() {

    }
}

let App = {
    template: `
    <authenticate auth-state="$ctrl.state" ng-hide="$ctrl.state == 'authed'"></authenticate>
    <conversations ng-show="$ctrl.state == 'authed'"></conversations>
    <p ng-show="$ctrl.state == 'invalidClient'"></p>
    `,
    controller: AppCtrl
}

export default App;