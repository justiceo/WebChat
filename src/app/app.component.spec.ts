import { Component, Input } from "@angular/core";
import { TestBed, async } from "@angular/core/testing";
import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent, MockChatComponent, MockAuthComponent]
      }).compileComponents();
    })
  );
  it(
    "should create the app",
    async(() => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app).toBeTruthy();
    })
  );
});

@Component({
  selector: "wc-chat",
  template: "chat content here"
})
class MockChatComponent {}

@Component({
  selector: "wc-auth",
  template: "auth ui here"
})
class MockAuthComponent {}
