import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {CacheService} from './cache.service';

/**
 * Http handler service that provides wrapper for ajax calls to server
 * with a cache layer
 */
@Injectable()
export class HttpHandlerService {
  constructor(private http: Http, private cache: CacheService) { }

  host(url?: string): string {
    return window.location.origin + url;
  }

  get(url: string): Observable<any> {
    return this.http.get(url).map((res) => {
      return res.json();
    });
  }

  getAndCache(url: string): Observable<any> {
    const cached = this.cache.get(url);
    if (cached) {
      return Observable.of(cached);
    } else {
      return this.get(url).map((json) => {
        this.cache.set(url, json);
        return json;
      });
    }
  }
}
