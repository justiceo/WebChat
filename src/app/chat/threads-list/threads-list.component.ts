import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { bufferCount } from 'rxjs/operators';

import { Thread } from '../../thread';
import { DataService } from '../../data.service';

@Component({
  selector: 'wc-threads-list',
  templateUrl: './threads-list.component.html',
  styleUrls: ['./threads-list.component.scss']
})
export class ThreadsListComponent implements OnInit {
  threads: Thread[];
  @Input() current: Thread;
  @Output() threadChange = new EventEmitter<Thread>();

  avatarUrl = 'https://randomuser.me/api/portraits/men/43.jpg';
  name = 'John Doe';
  notification = { type: 'EnableNotifications'};

  constructor(private dataService: DataService) {
    this.threads = dataService.getThreads();
    // this.current = this.threads[0]; // uncomment to use first thread as default
    this.current = new Thread();
  }

  changeThread(t: Thread) {
    this.current = t;
    this.threadChange.emit(t);
  }

  ngOnInit() {
    // this.threadChange.emit(this.current);
  }
}
