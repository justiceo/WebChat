export class AppCtrl {
    constructor($scope) {
        $scope.$watch(()=> this.appState, (e)=> {
            console.log("appState: ", e);
        })
    }
}

let App = {
    template: `
    <div class="wrapper" ng-switch="$ctrl.appState">
        <authenticate state="$ctrl.appState" ng-hide="$ctrl.appState=='roomAuthed'"></authenticate>
        <conversations ng-show="$ctrl.appState=='roomAuthed'"></conversations>
    </div>
    `,
    controller: AppCtrl
}

export default App;