import { mergeMap, takeWhile, pairwise, map, expand } from "rxjs/operators";
import { Observable, Subject, ReplaySubject, from, zip, of } from "rxjs";
import { Injectable } from "@angular/core";

import { HttpHandlerService } from "./http_handler.service";
import { MessageContentType, Message } from "../model/message";
import { Thread } from "../model/thread";
import { AuthService } from "./auth.service";
import { CacheService } from "./cache.service";
import { IdToMessages, IdToThread } from "../model/repository";
import { Event, Handler } from "../../server/events";

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
  readonly allThreadsRef = "all_threads";

  constructor(
    private cache: CacheService,
    private auth: AuthService
  ) {
    // TODO: this.fetchThreads();

    this.auth.register(Event.Threads, this.onThread)
  }

  getMessagesAsyc(threadID: string) {
    const messages: Message[] = this.cache.get(threadID + this.mRef);
    let lastTimestamp = -1;
    if (messages != null) {
      messages.forEach(m => this.messageSubj.next(m));
      lastTimestamp = messages[messages.length - 1].timestamp;
    }
    console.log("dataservice - get lastest from ", threadID, lastTimestamp);
    this.auth.emit("get_messages_after", threadID, lastTimestamp);
  }

  onThread(socket: SocketIO.Socket, thread: Thread): boolean {
    this.threadSubj.next(thread);
    return true;
  }

  getMessagesSubj(): Observable<Message> {
    return this.messageSubj.asObservable();
  }

  getThreadsAsync(): Observable<Thread> {
    const threads: Thread[] = this.cache.get(this.allThreadsRef) || [];
    let lastTimestamp = -1;
    if (threads != null && threads.length > 0) {
      threads.forEach(t => {
        this.threadSubj.next(t);
      });
      lastTimestamp = threads[threads.length - 1].timestamp;
    }
    this.auth.emit("threadsRequest", lastTimestamp);
    return this.threadSubj.asObservable();
  }

  getThreadInfo(id: string): Thread {
    return this.cache.get(id + this.tRef);
  }

  sendMessageAsync(threadID: string, message: string) {
    console.log("data-service: sending message -> ", threadID, message);
    const m = Message.make(threadID, this.userMe, message);
    let conv: Message[] = this.cache.get(threadID + this.mRef);
    let thread: Thread = this.cache.get(threadID + this.tRef);
    const threads: Thread[] = this.cache.get(this.allThreadsRef);

    // If this message is starting a new thread, create it.
    if (conv == null) {
      thread = Thread.make(threadID, threadID, [threadID]);
      conv = [];
    }

    // Use previous message for context in updating some ui elements.
    // This logic maybe implemented by phone.
    const prev = conv[conv.length - 1];
    if (!prev) {
      m.isNewDay = true;
    } else {
      m.isNewDay =
        new Date(prev.timestamp).getDate() !== new Date(m.timestamp).getDate();
      prev.isLocalLast = prev.userID === m.userID;
    }
    m.id = this.makeID();

    // Update data containers and subscriptions.
    conv.push(m);
    this.messageSubj.next(m);
    thread.timestamp = m.timestamp;
    thread.snippet = m.content;
    this.threadSubj.next(thread);
    threads.push(thread);

    // Update storage.
    this.cache.set(threadID + this.mRef, conv);
    this.cache.set(threadID + this.tRef, thread);
    this.cache.set(this.allThreadsRef, threads);

    // Fire request to send the message.
    this.auth.emit("new_message", threadID, message);
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
}
