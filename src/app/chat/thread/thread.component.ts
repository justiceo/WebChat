import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
})
export class ThreadComponent implements OnInit {

  messages = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7];
  avatarUrl = "https://randomuser.me/api/portraits/men/41.jpg";
  constructor() { }

  ngOnInit() {
  }

}
