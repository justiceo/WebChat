import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {bufferCount} from 'rxjs/operators';

import {Thread} from '../../thread';
import {DataService} from '../../data.service';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent implements OnInit {
  threads: Thread[];
  @Input() current: Thread;
  @Output() threadChange = new EventEmitter<Thread>();
  constructor(private dataService: DataService) {
    this.threads = dataService.getThreads();
    this.current = this.threads[0];
  }

  changeThread(t: Thread) {
    this.threadChange.emit(t);
  }

  ngOnInit() {
    this.threadChange.emit(this.current);
  }
}
