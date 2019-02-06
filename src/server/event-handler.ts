import { mergeMap, takeWhile, pairwise, map, expand } from "rxjs/operators";
import { Observable, Subject, ReplaySubject, from, zip, of } from "rxjs";
import { RedisClient } from "redis";
import { Event, Handler } from "./events";
import { Token } from "./token";
import Cache  from "./cache";
import HttpHandler  from "./http_handler";
import  Message  from "./message";
import  Thread  from "./thread";

export default class EventHandler {
  authTokens: Map<string, Token> = new Map();
  private messageSubj = new Subject<Message>();
  private threadSubj = new Subject<Thread>();
  readonly mRef = ":messages";
  readonly tRef = ":info";
  readonly userMe = "me";
  readonly allThreadsRef = "all_threads";

  constructor(
    private db: RedisClient, 
    private http: HttpHandler,
    private cache:Cache) {}

  registerEvents(server: SocketIO.Server) {
    server.on(Event.Connection, (socket: SocketIO.Socket) => {
      socket.on(Event.TokenRequest, () => {
        this.onTokenRequest(socket);
      });
    });
  }

  onTokenRequest(socket: SocketIO.Socket): boolean {
    // TODO(justiceo): Remove this client from all other rooms they may be in.
    socket.emit(Event.Token, this.makeAuthToken(socket));
    return true;
  }

  isValidAuthToken(socket: SocketIO.Socket, token: Token): boolean {
    const t = this.authTokens.get(socket.id);
    return t.token === token.token && t.expires > Date.now() - 60 * 1000; // 1 minute
  }

  makeAuthToken(socket: SocketIO.Socket): string {
    let tokenStr = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 100; i++) {
      tokenStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const t = {
      token: tokenStr,
      expires: Date.now()
    };
    this.authTokens.set(socket.id, t);
    return tokenStr;
  }

  genThreads() {
    const threads: Thread[] = [];
    this.getRandomUsers()
      .subscribe((t: Thread) => {
        const conv: Message[] = this.cache.get(t.id + this.mRef) || [];
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
            this.cache.set(this.allThreadsRef, threads);
            this.threadSubj.next(t);
          });
      })
      .add(() => {});
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
          // don't create group with one person, otherwise 75% of the time, let it be one person.
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
        const m = Message.make(
          threadID,
          this.chooseAny([...userIDs, this.userMe]),
          quote
        );
        m.id = this.makeID();
        lastTimeStamp = this.getTimeAfter(lastTimeStamp);
        m.timestamp = lastTimeStamp;
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

  makeID(): string {
    let tokenStr = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++) {
      tokenStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tokenStr + Date.now();
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

  // a day is about 86400000 milliseconds
  getTimeAfter(timestamp: number): number {
    return timestamp + this.randomInt(0, 50000000);
  }
}
