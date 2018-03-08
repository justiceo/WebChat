import { SmsMessage } from './message';
import { Thread } from './thread';

export interface SmsRepository {
    getMessages(id: string): SmsMessage[];
    getThreads(): Thread[];
}

export interface SmsRepo {
    [index: string]: SmsMessage[];
}
export interface ThreadRepo {
    [index: string]: Thread;
}

export class HardCodedSmsRepository implements SmsRepository {
    smsRepo: SmsRepo;
    threadRepo: ThreadRepo;

    constructor() {
        const m1 = SmsMessage.make('a-thread', 'other-user', 'hello world text');
        const m2 = SmsMessage.make('b-thread', 'another-user', 'another world text');

        const t1 = Thread.make('a-thread', 'john t', ['other-user']);
        const t2 = Thread.make('b-thread', 'thread 2', ['another-user']);
        this.smsRepo = { 'a-thread': [m1], 'b-thread': [m2] };
        this.threadRepo = { 'a-thread': t1, 'b-thread': t2 };
    }

    getMessages(threadID: string): SmsMessage[] {
        return this.smsRepo[threadID];
    }

    getThreads(): Thread[] {
        return Object.values(this.threadRepo);
    }

    getThreadById(id: string): Thread {
        return this.threadRepo[id];
    }
}
