import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {bufferTime} from 'rxjs/operators';

import {Contact} from '../../contact';
import {DataService} from '../../data.service';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent implements OnInit {
  threads: Observable<Contact[]>;
  constructor(private dataService: DataService) {
    this.threads = dataService.getRandomUsers().pipe(bufferTime(100));
  }

  ngOnInit() {}
}
