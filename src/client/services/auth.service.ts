import { Injectable } from "@angular/core";
import { Observable, Subject, interval, timer } from "rxjs";
import { map, takeUntil, startWith } from "rxjs/operators";
import io from "socket.io-client";

import { CacheService } from "./cache.service";
import { Event, Handler } from "../../server/events";
import { Token } from "../../server/token";

@Injectable()
export class AuthService {
  private socket: SocketIO.Socket = io();
  private isAuthedSubj = new Subject<boolean>();
  private tokenSubj = new Subject<string>();
  readonly TokenKey = "auth-token";

  constructor(private cache: CacheService) {
    this.registerHandlers();
    const token = cache.get(this.TokenKey);
    this.isAuthedSubj.next(token != null);
  }

  registerHandlers() {
    // NB: This client should only ever have one socket, the one associate with this class.
    this.socket.on(Event.Connect, () => {
      console.log("soc-service: connection established.");
      this.socket.on(Event.Token, (token: string) => {
        this.onToken(this.socket, token);
      });
      this.socket.on(Event.Paired, (token: Token) => {
        this.onPaired(this.socket, token);
      });
      this.socket.on(Event.Suspend, () => {
        this.onSuspend(this.socket);
      });
      this.socket.on(Event.Disconnect, () => {
        this.onDisconnect(this.socket);
      });
      this.socket.on(Event.Threads, (args) => {
        console.log("received thread: ", args)
      });
      this.socket.on(Event.Threads, (args) => {
        console.log("second registered thread eent: " ,args)
      });
    });
  }


  register(event: Event, f: (s: SocketIO.Socket, ...args: any[]) => void ) {
    this.socket.on(event, (...args) => {
      console.log("auth-service received event: ", event, " to be handled by ", f.name)
      f(this.socket, ...args)})
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }

  onToken(socket: SocketIO.Socket, token: string): boolean {
    console.log("soc-service: tokenstr: ", token);
    this.tokenSubj.next(token);
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
    return true;
  }

  onDisconnect(socket: SocketIO.Socket): boolean {
    this.tokenSubj.complete();
    this.isAuthedSubj.complete();
    return true;
  }

  isClientAuthed(): Observable<boolean> {
    return this.isAuthedSubj.asObservable();
  }

  requestToken(): Observable<string> {
    const oneMinute = 6000;
    interval(oneMinute)
      .pipe(
        startWith(0),
        takeUntil(timer(oneMinute * 8)),
        takeUntil(this.isAuthedSubj)
      )
      .subscribe(x => {
        // automatic login after 1 sec.
        if (x === 1) {
          this.isAuthedSubj.next(true);
        }
        console.log("socket-service: emitting token request ", x);
        this.socket.emit(Event.TokenRequest);
      })
      .add(() => {
        this.tokenSubj.complete();
      });
    return this.tokenSubj.asObservable();
  }
}
