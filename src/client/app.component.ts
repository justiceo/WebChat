import { Component, ViewEncapsulation } from "@angular/core";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "wc-root",
  template: `<wc-chat *ngIf="isAuthed"></wc-chat>
  <wc-auth *ngIf="!isAuthed"></wc-auth>`,
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  isAuthed: boolean;
  title = "app";

  constructor(private auth: AuthService) {
    auth
      .isClientAuthed()
      .subscribe(
        next => (this.isAuthed = next),
        err => console.log("wc-root: ", err)
      );
  }
}
