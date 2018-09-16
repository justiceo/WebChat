import { mergeMap, takeWhile, pairwise, map, expand } from "rxjs/operators";
import { Observable, Subject, ReplaySubject, from, zip, of } from "rxjs";
import { Injectable } from "@angular/core";

import { HttpHandlerService } from "./http_handler.service";
import { MessageContentType, Message } from "../model/message";
import { Thread } from "../model/thread";
import { AuthService } from "./auth.service";
import { CacheService } from "./cache.service";
import { IdToMessages, IdToThread } from "../model/repository";

// todo: serve bootstrap locally. Resolve randomapi from file if no internet.
// that means that server needs to make the call
@Injectable()
export class DataService {
  smsRepo: IdToMessages = {};
  threadRepo: IdToThread = {};
  private messageSubj = new Subject<Message>();
  private threadSubj = new Subject<Thread>();
  readonly mRef = ":messages";
  readonly tRef = ":info";
  readonly userMe = "me";

  constructor(
    private http: HttpHandlerService,
    private cache: CacheService,
    private auth: AuthService
  ) {
    this.genThreads();
  }

  getMessagesAsyc(threadID: string): Observable<Message> {
    const messages: Message[] = this.cache.get(threadID + this.mRef);
    let messageSubj = new ReplaySubject<Message>();
    let lastTimestamp = -1;
    if (messages != null) {
      messages.forEach(m => {
        messageSubj.next(m);
      });
      lastTimestamp = messages[messages.length - 1].timestamp;
    }
    console.log("dataservice - get lastest from ", threadID, lastTimestamp);
    this.auth.emit("get_messages_after", threadID, lastTimestamp);
    return messageSubj.asObservable();
  }

  getThreadsAsync(): Observable<Thread> {
    const threads: Thread[] = this.cache.get("threads") || [];
    let lastTimestamp = -1;
    if (threads != null && threads.length > 0) {
      threads.forEach(t => {
        this.threadSubj.next(t);
      });
      lastTimestamp = threads[threads.length - 1].timestamp;
    }
    this.auth.emit("get_threads_after", lastTimestamp);
    return this.threadSubj.asObservable();
  }

  genThreads() {
    let threads: Thread[] = [];
    this.getRandomUsers()
      .subscribe((t: Thread) => {
        let conv: Message[] = this.cache.get(t.id + this.mRef) || [];
        const lastTimeStamp = conv.length ? conv[conv.length - 1].timestamp : 0;
        this.genMessages(t.id, t.userIDs)
          .forEach(m => {
            // Only add newer messages
            if (m.timestamp > lastTimeStamp) {
              conv.push(m);
            }
          })
          .then(() => {
            const last = conv[conv.length - 1];
            t.timestamp = last.timestamp;
            t.snippet = last.content;
            t.unreadCount = this.chooseAny([0, 0, 0, 0, 1, 2, 3, 5, 8]);
            this.cache.set(t.id + this.mRef, conv);
            this.cache.set(t.id + this.tRef, t);
            threads.push(t);
            this.cache.set("threads", threads);
            this.threadSubj.next(t);
          });
      })
      .add(() => {});
  }

  getThreadInfo(id: string): Thread {
    return this.threadRepo[id];
  }

  getQuotes(): Observable<string> {
    return this.http
      .getAndCache("https://talaikis.com/api/quotes/")
      .pipe(mergeMap(x => x), map(x => x["quote"]));
  }

  genMessages(threadID: string, userIDs: string[]): Observable<Message> {
    const day = 86400000;
    let lastTimeStamp = Date.now() - day * 3;
    return this.getQuotes().pipe(
      map(quote => {
        const m = new Message();
        m.id = this.makeID();
        m.contentType = MessageContentType.PlainText;
        m.content = quote;
        m.userID = this.chooseAny([...userIDs, this.userMe]);
        lastTimeStamp = this.getTimeAfter(lastTimeStamp);
        m.timestamp = lastTimeStamp;
        m.threadID = threadID;
        return m;
      }),
      takeWhile(m => m.timestamp < Date.now()),
      pairwise(),
      mergeMap((pair: Message[]) => {
        if (pair.length === 1) {
          pair[0].isLocalLast = true;
          pair[0].isNewDay = true;
          return of(pair[0]);
        }

        const curr = pair[0];
        const next = pair[1];
        if (curr.userID !== next.userID) {
          curr.isLocalLast = true;
        }
        if (
          new Date(curr.timestamp).getDate() !==
          new Date(next.timestamp).getDate()
        ) {
          next.isNewDay = true;
        }
        return of(curr);
      })
    );
  }

  sendMessageAsync(threadID: string, message: string) {}

  makeID(): string {
    let tokenStr = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++) {
      tokenStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tokenStr + Date.now();
  }

  getRandomUsers(): Observable<Thread> {
    const cap = (x: string) => x.charAt(0).toUpperCase() + x.substr(1);
    return this.http
      .getAndCache(
        "https://randomuser.me/api/?inc=name,cell,picture&results=20"
      )
      .pipe(
        map(x => x["results"]),
        mergeMap(x => x),
        map(x => {
          const thread = new Thread();
          thread.name = cap(x["name"]["first"]) + " " + cap(x["name"]["last"]);
          thread.avatar = x["picture"]["large"];
          thread.id = x["cell"];
          thread.userIDs = [thread.id];
          return thread;
        }),
        pairwise(),
        mergeMap((pair: Thread[]) => {
          const prob = this.randomInt(0, 100);
          if (pair.length < 2 || prob < 75) {
            return pair;
          }
          const x = pair[0];
          const y = pair[1];
          const thread = new Thread();
          thread.name = x.name + ", " + y.name;
          thread.avatar =
            "https://image.freepik.com/free-icon/group_318-27951.jpg";
          // for merging avatars, see https://stackoverflow.com/a/15620872
          thread.id = x.id + y.id;
          thread.userIDs = [x.id, y.id];
          pair.push(thread);
          return pair;
        })
      );
  }

  // Returns a random integer between min (included) and max (included)
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  chooseAny<E>(arr: E[]): E {
    if (!arr || arr.length === 0) {
      throw new Error("cannot choose from null or empty array");
    }
    return arr[this.randomInt(0, arr.length - 1)];
  }

  addOrUpdate(arr: { id: string }[], e: { id: string }) {
    let found = false;
    arr.forEach(i => {
      if (i.id == e.id) {
        i = e;
        found = true;
      }
    });
    if (!found) {
      arr.push(e);
    }
  }

  // a day is about 86400000 milliseconds
  getTimeAfter(timestamp: number): number {
    return timestamp + this.randomInt(0, 50000000);
  }
}
