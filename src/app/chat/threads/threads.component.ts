import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent implements OnInit {

  threads = [];
  constructor(private dataService: DataService) {
    this.dataService.getRandomUsers().subscribe(data => {
      for(let user of data['results']) {
        this.threads.push({
            'name': user['name']['first'] + ' ' + user['name']['last'],
            'avatarUrl': user['picture']['large'],
            'body': user['cell'],
        });
      }
    });
   }

  ngOnInit() {
  }
}
