import { Component, Input } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        AuthComponent,
        MockChatComponent,
        MockQRCodeComponent,
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});



@Component({
  selector: 'wc-chat',
  template: 'chat content here'
})
class MockChatComponent {
}


@Component({
  selector: 'qr-code', // tslint:disable-line
  template: 'passcode here'
})
class MockQRCodeComponent {
  @Input()
  value: string;

  @Input()
  size: number;
}
