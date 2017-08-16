
export class AppCtrl {
    constructor() {
        this.state = "notAuthed";
    }
}

let App = {
    template: `
    <div class="wrapper" ng-switch="$ctrl.state">
        <authenticate auth-state="$ctrl.state" ng-switch-when="notAuthed"></authenticate>
        <conversations ng-switch-when="authed"></conversations>
        <p ng-switch-default></p>
    </div>
    `,
    controller: AppCtrl
}

export default App;