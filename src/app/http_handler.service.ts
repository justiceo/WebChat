import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

/**
 * Http handler service that provides wrapper for ajax calls to server
 * with a cache layer
 */
@Injectable()
export class HttpHandlerService {
  storage: Storage = window.sessionStorage;

  constructor(private http: Http) { }

  host(url?: string): string {
    return window.location.origin + url;
  }

  get(url: string): Observable<any> {
    const cached = this.getCacheItem(url);
    if (cached) {
      return Observable.of(cached);
    } else {
      return this.http.get(url).map((res) => {
        this.setCacheItem(url, res.json());
        return res.text();
      });
    }
  }

  getCacheItem(key: string): any {
    return JSON.parse(this.storage.getItem(key));
  }

  setCacheItem(key: string, value: any): string {
    let strVal = JSON.stringify(value);
    this.storage.setItem(key, strVal);
    return strVal;
  }
}