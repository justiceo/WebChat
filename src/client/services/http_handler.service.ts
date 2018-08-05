import { of as observableOf, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { CacheService } from "./cache.service";

/**
 * Http handler service that provides wrapper for ajax calls to server
 * with a cache layer
 */
@Injectable()
export class HttpHandlerService {
  constructor(private http: HttpClient, private cache: CacheService) {}

  host(url?: string): string {
    return window.location.origin + url;
  }

  get(url: string): Observable<any> {
    return this.http.get(url).pipe(
      map(res => {
        return res;
      })
    );
  }

  getAndCache(url: string): Observable<any> {
    const cached = this.cache.get(url);
    if (cached) {
      return observableOf(cached);
    } else {
      return this.get(url).pipe(
        map(json => {
          this.cache.set(url, json);
          return json;
        })
      );
    }
  }
}
