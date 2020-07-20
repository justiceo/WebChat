import { of as observableOf, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import Cache from "./cache";
import * as http from "http";
import * as https from "https";


/**
 * Http handler service that provides wrapper for ajax calls to server
 * with a cache layer
 */
export default class HttpHandler {
  constructor(private cache: Cache) { }

  host(url?: string): string {
    return window.location.origin + url;
  }

  get(url: string): Observable<any> {
    var subj = new Subject<any>();
    if (url.startsWith("https")) {
      console.log(`fetching url: ${url}`);
      https.get(url, (res) => {
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            subj.next(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on("error", (err) => {
        console.error(`error fetching ${url}: ${err.message}`)
      });
    } else {
      http.get(url, (res) => {
        console.log("http-req-success: ", url)
        res.on('data', (d) => {
          subj.next(d)
        });
      });
    }
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
