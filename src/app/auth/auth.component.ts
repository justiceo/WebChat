import { Component, OnInit } from "@angular/core";

@Component({
  selector: "wc-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"]
})
export class AuthComponent implements OnInit {
  qrcode = "so my dear, this is an intentionally long text for use in generating qr code for authentication in the auth component.";
  constructor() {}

  ngOnInit() {}
}
