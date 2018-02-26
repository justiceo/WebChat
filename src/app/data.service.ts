import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import {HttpHandlerService} from './http_handler.service';

@Injectable()
export class DataService {

  constructor(private http: HttpHandlerService) {
    // todo: get random users and cache it
    // get random quotes and cache it
    // create a random time generator between now and 3 days ago
  }


  getRandomUsers(): Observable<any> {
    return this.http.get("https://randomuser.me/api/?inc=name,cell,picture&results=20");
  }

  // quotes url: https://talaikis.com/api/quotes/ (100 at once)
}
