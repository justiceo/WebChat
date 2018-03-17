import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'wc-root',
  template: `<wc-chat *ngIf="isAuthed"></wc-chat>
  <wc-auth *ngIf="!isAuthed"></wc-auth>`,
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  isAuthed = true;
  title = 'app';
}
