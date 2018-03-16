import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<app-chat *ngIf="isAuthed"></app-chat>
  <app-auth *ngIf="!isAuthed"></app-auth>`,
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'app';
}
