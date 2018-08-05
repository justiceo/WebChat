import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, Input } from "@angular/core";
import { AuthComponent } from "./auth.component";

describe("AuthComponent", () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AuthComponent, MockQRCodeComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: "qr-code", // tslint:disable-line
  template: "passcode here"
})
class MockQRCodeComponent {
  @Input() value: string;

  @Input() size: number;
}
