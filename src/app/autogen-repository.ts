import 'rxjs/add/operator/map';
import 'rxjs/add/operator/expand';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/windowCount';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/takeWhile';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { zip } from 'rxjs/observable/zip';
import { expand } from 'rxjs/operators';

import { HttpHandlerService } from './http_handler.service';
import { SmsContentType, SmsMessage } from './message';
import { Thread } from './thread';
import { SmsRepository, SmsRepo, ThreadRepo } from './sms-repository';


export class AutoGenRepository implements SmsRepository {
    smsRepo: SmsRepo;
    threadRepo: ThreadRepo;

    constructor(private http: HttpHandlerService) {
        // TODO(justiceo): initialize repo
        const messages = zip(this.getQuotes(), this.getRandomUsers());
        const day = 86400000;
        let lastTimeStamp = Date.now() - day * 3;
        const msub = messages
            .map(val => {
                const quote = val[0];
                const thread: any = val[1];
                const m = new SmsMessage();
                m.contentType = SmsContentType.PlainText;
                m.content = quote;
                m.userID = this.chooseAny(['other', 'me']);
                lastTimeStamp = this.getTimeAfter(lastTimeStamp);
                m.timestamp = lastTimeStamp;
                m.threadID = 'a-thread';
                return m;
            })
            .takeWhile(m => m.timestamp < Date.now())
            .pairwise()
            .flatMap((pair: SmsMessage[]) => {
                if (pair.length === 1) {
                    pair[0].isLocalLast = true;
                    pair[0].isNewDay = true;
                    return Observable.of(pair[0]);
                }

                const prev = pair[0];
                const next = pair[1];
                if (prev.userID !== next.userID) {
                    prev.isLocalLast = true;
                }
                if (new Date(prev.timestamp).getDate() !== new Date(next.timestamp).getDate()) {
                    next.isNewDay = true;
                }
                return Observable.of(prev);
            });

        this.smsRepo = { 'a-thread': [] };
        msub.subscribe(m => this.smsRepo[m.threadID].push(m));
        this.threadRepo = { 'a-thread': Thread.make('a-thread', 'thread name', ['other']) };

    }

    getQuotes(): Observable<string> {
        return this.http.getAndCache('https://talaikis.com/api/quotes/')
            .flatMap(x => x)
            .map(x => x['quote']);
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


    // a day is about 86400000 milliseconds
    getTimeAfter(timestamp: number): number {
        return timestamp + this.randomInt(0, 50000000);
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
