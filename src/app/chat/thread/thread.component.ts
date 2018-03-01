import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {bufferTime} from 'rxjs/operators';

import {DataService} from '../../data.service';
import {SmsContentType, SmsMessage} from '../../message';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
})
export class ThreadComponent implements OnInit {
  messages: Observable<SmsMessage[]>;
  avatarUrl = 'https://randomuser.me/api/portraits/men/41.jpg';
  constructor(private dataService: DataService) {
    this.messages = dataService.getMessages('thread_id').pipe(bufferTime(100));
  }

  ngOnInit() {}
}
