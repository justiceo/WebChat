import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

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

  get(url: string): Observable<string> {
    const cached = this.cache(url);
    if (cached) {
      return cached;
    } else {
      return this.http.get(url).map((res) => {
        this.cache(url, res.text());
        return res.text();
      });
    }
  }

  cache(key: string, value?: {}): Observable<string> {
    if (!value) {
      return JSON.parse(this.storage.getItem(key) || 'null');
    }
    this.storage.setItem(key, JSON.stringify(value));
    return this.cache(key);
  }
}