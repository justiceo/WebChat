import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) {
    // todo: get random users and cache it
    // get random quotes and cache it
    // create a random time generator between now and 3 days ago
  }


  getRandomUsers() {
    return this.http.get("https://randomuser.me/api/?inc=name,cell,picture&results=20");
  }

  // quotes url: https://talaikis.com/api/quotes/ (100 at once)
}
