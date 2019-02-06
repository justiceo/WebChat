import { of as observableOf, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import Cache from "./cache";
import * as http from "http";


/**
 * Http handler service that provides wrapper for ajax calls to server
 * with a cache layer
 */
export default class HttpHandler {
  constructor(private cache: Cache) {}

  host(url?: string): string {
    return window.location.origin + url;
  }

  get(url: string): Observable<any> {
    var subj = new Subject<any>();
    http.get(url, (res:http.IncomingMessage)=>{
      subj.next(res)
    });
    return subj.asObservable();
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
