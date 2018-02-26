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
      data = JSON.parse(data);
      let results: Array<any> = data["results"];
      results.forEach(u => {
        this.threads.push({
          'name': this.toTitleCase(u['name']['first']) + ' ' + this.toTitleCase(u['name']['last']),
          'avatarUrl': u['picture']['large'],
          'body': u['cell'],
        });
      })
    });
  }

  ngOnInit() {
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }
}
