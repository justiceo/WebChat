import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { bufferTime } from 'rxjs/operators';

import { DataService } from '../../data.service';
import { SmsContentType, SmsMessage } from '../../message';
import { Thread } from '../../thread';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss'],
})
export class ThreadComponent implements OnInit {
  messages: SmsMessage[];
  _thread: Thread;

  @Input()
  set thread(t: Thread) {
    this._thread = t;
    this.messages = this.dataService.getMessages(t.id);
  }

  avatarUrl = 'https://randomuser.me/api/portraits/men/41.jpg';
  constructor(private dataService: DataService) {
    if (this._thread) {
      this.messages = dataService.getMessages(this._thread.id);
    }
  }

  ngOnInit() { }
}
