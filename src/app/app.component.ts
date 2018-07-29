import { Component, ViewEncapsulation } from "@angular/core";
import { SocketService } from "./services/socket.service";

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

  constructor(private socketService: SocketService) {
    socketService
      .isClientAuthed()
      .subscribe(
        next => (this.isAuthed = next),
        err => console.log("wc-root: ", err)
      );
  }
}
