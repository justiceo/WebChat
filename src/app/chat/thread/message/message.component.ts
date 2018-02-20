import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
})
export class MessageComponent implements OnInit {

  avatarUrl = "https://randomuser.me/api/portraits/men/43.jpg";
  constructor() { }

  ngOnInit() {
  }

}
