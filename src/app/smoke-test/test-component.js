export class TestCtrl {
  constructor() {
    this.sample = 'angular works!';
  }
}

let TestComponent = {
  templateUrl: 'app/smoke-test/test-view.html',
  controller: TestCtrl
}

export default TestComponent;