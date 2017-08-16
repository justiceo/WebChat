export class AppCtrl {
    constructor($scope) {
    }
}

let App = {
    template: `
    <div class="wrapper" ng-switch="$ctrl.appState">
        <authenticate state="$ctrl.appState" ng-hide="$ctrl.appState=='roomAuthed'"></authenticate>
        <conversations ng-if="$ctrl.appState=='roomAuthed'" ng-switch-default></conversations>
    </div>
    `,
    controller: AppCtrl
}

export default App;