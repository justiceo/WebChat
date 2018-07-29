import { Component, OnInit } from "@angular/core";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "wc-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"]
})
export class AuthComponent implements OnInit {
  qrcode = "so my dear, this is an intentionally long text for use in generating qr code for authentication in the auth component.";
  constructor(private socketService: SocketService) {
    socketService.requestToken().subscribe(
      next => (this.qrcode = next),
      error => console.log("wc-auth: ", error),
      () => {
        // TODO: display refresh icon
      }
    );
  }

  ngOnInit() {}
}
