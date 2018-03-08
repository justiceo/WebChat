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

  get thread() {
    return this._thread;
  }

  @Input()
  set thread(t: Thread) {
    if (!t) { return; }
    this._thread = t;
    this.messages = this.dataService.getMessages(t.id);
  }

  constructor(private dataService: DataService) {
    if (this._thread) {
      this.messages = dataService.getMessages(this._thread.id);
    }
  }

  ngOnInit() { }
}
