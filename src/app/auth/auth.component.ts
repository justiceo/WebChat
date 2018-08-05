import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "wc-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"]
})
export class AuthComponent implements OnInit {
  qrcode = "so my dear, this is an intentionally long text for use in generating qr code for authentication in the auth component.";
  constructor(private auth: AuthService) {
    auth.requestToken().subscribe(
      next => (this.qrcode = next),
      error => console.log("wc-auth: ", error),
      () => {
        console.log("wc-auth: completing token request subscription.");
        // TODO: display refresh icon
      }
    );
  }

  ngOnInit() {}
}
