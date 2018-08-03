import { Component, OnInit } from "@angular/core";

@Component({
  selector: "wc-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit {
  currThread;
  constructor() {}

  ngOnInit() {}
}
