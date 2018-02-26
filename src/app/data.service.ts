import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HttpHandlerService } from './http_handler.service';
import { SmsMessage, SmsContentType } from './message';


@Injectable()
export class DataService {

  quotes: Array<string> = [];

  constructor(private http: HttpHandlerService) { }

  loadQuotes(): Observable<Array<string>> {
    return this.http.get('https://talaikis.com/api/quotes/').map(data => data.map(q => q['quote']));
  }

  getRandomUsers(): Observable<any> {
    return this.http.get("https://randomuser.me/api/?inc=name,cell,picture&results=20");
  }

  getMessages(threadID: string): Observable<Array<SmsMessage>> {

    let cached: Array<SmsMessage> = this.http.getCacheItem(threadID);
    if (cached) {
      return Observable.of(cached);
    }

    let mCount = this.randomInt(1, 100);
    let mList: Array<SmsMessage> = [];
    let lastTimeStamp = Date.now();
    for (let i = 0; i < mCount; i++) {
      let m = new SmsMessage();
      m.contentType = this.randomContentType();
      m.content = this.randomContent(m.contentType);
      m.userID = this.randomUserID();
      lastTimeStamp = this.getTimeBefore(lastTimeStamp);
      m.timestamp = lastTimeStamp;
      mList.push(m);
    }

    return Observable.of(mList);
  }

  // Returns a random integer between min (included) and max (included)
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  chooseAny<E>(arr: Array<E>): E {
    if (!arr || arr.length == 0) {
      throw 'cannot choose from null or empty array';
    }
    return arr[this.randomInt(0, arr.length - 1)];
  }

  randomContentType(): SmsContentType {
    return this.chooseAny([SmsContentType.PlainText, SmsContentType.EmojiText, SmsContentType.Image, SmsContentType.Video]);
  }

  randomContent(type: SmsContentType): any {
    switch (type) {
      case SmsContentType.PlainText: {
        return this.chooseAny(this.quotes);
      }
      case SmsContentType.Image: {
        return this.chooseAny(['https://picsum.photos/200/300/?random', 'https://picsum.photos/200/150/?random', 'https://picsum.photos/g/300/300/?random', 'https://picsum.photos/1600/900/?random'])
      }
      case SmsContentType.EmojiText: {
        return this.chooseAny(this.quotes) + ":)  :D";
      }
      default:
        return this.chooseAny(this.quotes);
    }
  }

  randomUserID(): string {
    return this.chooseAny(["my_id", "other_contact_id"]);
  }

  getTimeBefore(timestamp: number): number {
    return timestamp - this.randomInt(0, 5000000);
  }
}
