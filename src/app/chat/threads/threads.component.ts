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
      for (let user of data['results']) {
        this.threads.push({
          'name': this.toTitleCase(user['name']['first']) + ' ' + this.toTitleCase(user['name']['last']),
          'avatarUrl': user['picture']['large'],
          'body': user['cell'],
        });
      }
    });
  }

  ngOnInit() {
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }
}
