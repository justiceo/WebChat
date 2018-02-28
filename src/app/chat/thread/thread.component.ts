import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { SmsMessage, SmsContentType } from '../../message';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
})
export class ThreadComponent implements OnInit {

  messages: Array<SmsMessage> = [];
  avatarUrl = "https://randomuser.me/api/portraits/men/41.jpg";
  constructor(private dataService: DataService) {
    dataService.getMessages("thread_id").subscribe(res => {
      res.forEach(m => this.messages.push(m))
    })
  }

  ngOnInit() {
  }

}
