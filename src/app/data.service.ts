import 'rxjs/add/operator/map';
import 'rxjs/add/operator/expand';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/windowCount';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/pairwise';

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {from} from 'rxjs/observable/from';
import {zip} from 'rxjs/observable/zip';
import {expand} from 'rxjs/operators';

import {HttpHandlerService} from './http_handler.service';
import {SmsContentType, SmsMessage} from './message';
import {Thread} from './thread';


@Injectable()
export class DataService {
  quotes: string[] = [];
  users: Thread[] = [];

  constructor(private http: HttpHandlerService) {}

  getQuotes(): Observable<string> {
    return this.http.getAndCache('https://talaikis.com/api/quotes/')
        .flatMap(x => x)
        .map(x => x['quote']);
  }

  getRandomUsers(): Observable<Thread> {
    const cap = (x: string) => x.charAt(0).toUpperCase() + x.substr(1);
    return this.http
        .getAndCache(
            'https://randomuser.me/api/?inc=name,cell,picture&results=20')
        .map(x => x['results'])
        .flatMap(x => x)
        .map(x => {
          const thread = new Thread();
          thread.name = cap(x['name']['first']) + ' ' + cap(x['name']['last']);
          thread.avatar = x['picture']['large'];
          thread.id = x['cell'];
          return thread;
        });
  }

  /**
   * TBD: Phase two requirement
   */
  getGroups(): Observable<Thread> {
    const groups = this.getRandomUsers().windowCount(10).map(win => {
      const gt = new Thread();
      gt.userIds = [];
      const mapped = win.concatMap((out, e) => {
        gt.name += ', ' + out.name;
        gt.id += ' ' + out.id;
        gt.userIds.push(out.id);
        out.name = name;
        out = gt;
        return Observable.of(out);
      });
      /*
      const groupSize = this.randomInt(2, 10);
      const groupThread2 = new Thread();
      groupThread.userIds = [];
      console.log("creating gthread from win: ", win);
      for (let i = 0; i < groupSize; i++) {
        const t: Thread = win[i];
        if(!t) {
          continue;
        }
        groupThread.name += ', ' + t.name;
        groupThread.id += t.id;
        groupThread.userIds.push(t.id);
      }
      return groupThread;*/
    });

    return null;
  }

  getMessages(threadID: string): Observable<SmsMessage> {
    const messages = zip(this.getQuotes(), this.getRandomUsers());
    let lastTimeStamp = Date.now();
    return messages
        .map(val => {
          const quote = val[0];
          const thread: any = val[1];
          const m = new SmsMessage();
          m.contentType = SmsContentType.PlainText;
          m.content = quote;
          m.userID = this.chooseAny(['other', 'me']);
          lastTimeStamp = this.getTimeBefore(lastTimeStamp);
          m.timestamp = lastTimeStamp;
          return m;
        })
        .pairwise()
        .flatMap((x: SmsMessage[]) => {
          if (x.length === 1) {
            x[0].isLocalLast = true;
            return Observable.of(x[0]);
          }
          if (x[0].userID !== x[1].userID) x[0].isLocalLast = true;
          return Observable.of(x[0]);
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
        ]);
      }
      case SmsContentType.EmojiText: {
        return this.chooseAny(this.quotes) + ':)  :D';
      }
      default:
        return this.chooseAny(this.quotes);
    }
  }

  randomUserID(): string {
    return this.chooseAny(['my_id', 'other_thread_id']);
  }

  getTimeBefore(timestamp: number): number {
    return timestamp - this.randomInt(0, 5000000);
  }
}
