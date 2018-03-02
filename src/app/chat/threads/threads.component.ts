import {Component, OnInit} from '@angular/core';
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
  threads: Observable<Thread[]>;
  constructor(private dataService: DataService) {
    this.threads = dataService.getRandomUsers().pipe(bufferCount(100));
  }

  ngOnInit() {}
}
