import { Message } from "./message";
import { Thread } from "./thread";

export interface IdToMessages {
  [index: string]: Message[];
}
export interface IdToThread {
  [index: string]: Thread;
}

export class HardCodedSmsRepository {
  idToMessages: IdToMessages;
  idToThread: IdToThread;

  constructor() {
    const m1 = Message.make("a-thread", "other-user", "hello world text");
    const m2 = Message.make("b-thread", "another-user", "another world text");

    const t1 = Thread.make("a-thread", "john t", ["other-user"]);
    const t2 = Thread.make("b-thread", "thread 2", ["another-user"]);
    this.idToMessages = { "a-thread": [m1], "b-thread": [m2] };
    this.idToThread = { "a-thread": t1, "b-thread": t2 };
  }

  getMessages(threadID: string): Message[] {
    return this.idToMessages[threadID];
  }

  getThreads(): Thread[] {
    return Object.values(this.idToThread);
  }

  getThreadInfo(id: string): Thread {
    return this.idToThread[id];
  }
}
