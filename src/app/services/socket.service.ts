import { Injectable } from "@angular/core";
import { Observable, Subject, interval, timer } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import io from "socket.io-client";

import { CacheService } from "./cache.service";
import { Event } from "../../common/events";

@Injectable()
export class SocketService {
  private socket: SocketIO.Socket = io();
  private isAuthedSubj = new Subject<boolean>();
  private tokenSubj = new Subject<string>();
  private pairedSubj = new Subject<string>();
  readonly TokenKey = "auth-token";

  constructor(private cache: CacheService) {
    let token = cache.get(this.TokenKey);
    // No need to watch localStorage, before/after setting this item call the subjects.
    // downside is  that other tabs may not receive it, which is better to prevent cross tab pollution.
    this.isAuthedSubj.next(token != null);

    this.socket.on(Event.TOKEN, args => {
      this.tokenSubj.next(args);
    });
  }

  isClientAuthed(): Observable<boolean> {
    return this.isAuthedSubj.asObservable();
  }

  requestToken(): Observable<string> {
    const oneMinute = 6000;
    interval(oneMinute)
      .pipe(takeUntil(timer(oneMinute * 8)), takeUntil(this.pairedSubj))
      .subscribe(x => {
        console.log("socket-service: emitting token request ", x);
        this.socket.emit(Event.TOKEN_REQUEST);
      });
    return this.tokenSubj.asObservable();
  }
}
