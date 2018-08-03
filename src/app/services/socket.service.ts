import { Injectable } from "@angular/core";
import { Observable, Subject, interval, timer } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import io from "socket.io-client";

import { CacheService } from "./cache.service";
import { Event, Handler } from "../../common/events";
import { Token } from "../../common/token";

@Injectable()
export class SocketService {
  private socket: SocketIO.Socket = io();
  private isAuthedSubj = new Subject<boolean>();
  private tokenSubj = new Subject<string>();
  private pairedSubj = new Subject<string>();
  readonly TokenKey = "auth-token";

  eventMap: { e: Event; h: Handler }[] = [
    { e: Event.TOKEN, h: this.onToken },
    { e: Event.Disconnect, h: this.onDisconnect },
    { e: Event.PAIRED, h: this.onPaired }
  ];

  constructor(private cache: CacheService) {
    this.registerHandlers();
    let token = cache.get(this.TokenKey);
    this.isAuthedSubj.next(token != null);
  }

  registerHandlers() {
    this.socket.on(Event.Connection, (socket: SocketIO.Socket) => {
      this.eventMap.forEach(e => {
        socket.on(e.e, (...args: any[]) => {
          e.h(socket, ...args);
        });
      });
    });
  }

  onToken(socket: SocketIO.Socket, tokenStr: string): boolean {
    console.log("soc-service: tokenstr: ", tokenStr);
    this.tokenSubj.next(tokenStr);
    return true;
  }

  onPaired(socket: SocketIO.Socket, token: Token): boolean {
    this.cache.set(this.TokenKey, token);
    this.isAuthedSubj.next(true);
    this.tokenSubj.complete();
    return true;
  }

  onSuspend(socket: SocketIO.Socket): boolean {
    this.tokenSubj.complete();
    this.pairedSubj.complete();
    return true;
  }

  onDisconnect(socket: SocketIO.Socket): boolean {
    this.tokenSubj.complete();
    this.pairedSubj.complete();
    this.isAuthedSubj.complete();
    return true;
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
      })
      .add(() => {
        this.tokenSubj.complete();
      });
    return this.tokenSubj.asObservable();
  }
}
