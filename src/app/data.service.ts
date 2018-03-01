import 'rxjs/add/operator/map';
import 'rxjs/add/operator/expand';
import 'rxjs/add/operator/mergeMap';

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {from} from 'rxjs/observable/from';
import {zip} from 'rxjs/observable/zip';
import {expand} from 'rxjs/operators';

import {Contact} from './contact';
import {HttpHandlerService} from './http_handler.service';
import {SmsContentType, SmsMessage} from './message';


@Injectable()
export class DataService {
  quotes: string[] = [];
  users: Contact[] = [];

  constructor(private http: HttpHandlerService) {}

  getQuotes(): Observable<string> {
    return this.http.get('https://talaikis.com/api/quotes/')
        .flatMap(x => x)
        .map(x => x['quote']);
  }

  getRandomUsers(): Observable<Contact> {
    const cap = (x: string) => x.charAt(0).toUpperCase() + x.substr(1);
    return this.http
        .get('https://randomuser.me/api/?inc=name,cell,picture&results=20')
        .map(x => x['results'])
        .flatMap(x => x)
        .map(x => {
          const contact = new Contact();
          contact.name = cap(x['name']['first']) + ' ' + cap(x['name']['last']);
          contact.avatarUrl = x['picture']['large'];
          contact.userID = x['cell'];
          return contact;
        });
  }

  getMessages(threadID: string): Observable<SmsMessage> {
    const messages = zip(this.getQuotes(), this.getRandomUsers());
    let lastTimeStamp = Date.now();
    return messages.map(val => {
      const [quote, user] = val;
      const m = new SmsMessage();
      m.contentType = SmsContentType.PlainText;
      m.content = quote;
      m.userID = user.userID;
      lastTimeStamp = this.getTimeBefore(lastTimeStamp);
      m.timestamp = lastTimeStamp;
      return m;
    });
  }

  // Returns a random integer between min (included) and max (included)
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  chooseAny<E>(arr: E[]): E {
    if (!arr || arr.length === 0) {
      throw new Error('cannot choose from null or empty array');
    }
    return arr[this.randomInt(0, arr.length - 1)];
  }

  randomContentType(): SmsContentType {
    return this.chooseAny([
      SmsContentType.PlainText, SmsContentType.EmojiText, SmsContentType.Image,
      SmsContentType.Video
    ]);
  }

  randomContent(type: SmsContentType): string {
    switch (type) {
      case SmsContentType.PlainText: {
        return this.chooseAny(this.quotes);
      }
      case SmsContentType.Image: {
        return this.chooseAny([
          'https://picsum.photos/200/300/?random',
          'https://picsum.photos/200/150/?random',
          'https://picsum.photos/g/300/300/?random',
          'https://picsum.photos/1600/900/?random'
        ])
      }
      case SmsContentType.EmojiText: {
        return this.chooseAny(this.quotes) + ':)  :D';
      }
      default:
        return this.chooseAny(this.quotes);
    }
  }

  randomUserID(): string {
    return this.chooseAny(['my_id', 'other_contact_id']);
  }

  getTimeBefore(timestamp: number): number {
    return timestamp - this.randomInt(0, 5000000);
  }
}
