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
import { MessageContentType, Message } from './message';
import { Thread } from './thread';
import { MessageRepository, IdToMessages, IdToThread } from './sms-repository';


export class AutoGenRepository implements MessageRepository {
    smsRepo: IdToMessages = {};
    threadRepo: IdToThread = {};

    constructor(private http: HttpHandlerService) {
        this.getRandomUsers().subscribe((t: Thread) => {
            this.threadRepo[t.id] = t;
            this.genMessages(t.id, t.userIds).subscribe(m => {
                if (!this.smsRepo[m.threadID]) {
                    this.smsRepo[m.threadID] = [];
                }
                this.smsRepo[m.threadID].push(m);

                // set message to last
                t.timestamp = m.timestamp;
                t.snippet = m.content;
                t.unreadCount = this.chooseAny([0, 1, 2, 5, 8]);
                t.isUnread = t.unreadCount !== 0;
            });
        });
    }

    getQuotes(): Observable<string> {
        return this.http.getAndCache('https://talaikis.com/api/quotes/')
            .flatMap(x => x)
            .map(x => x['quote']);
    }

    genMessages(threadID: string, userIDs: string[]): Observable<Message> {
        const day = 86400000;
        let lastTimeStamp = Date.now() - day * 3;
        return this.getQuotes()
            .map(quote => {
                const m = new Message();
                m.contentType = MessageContentType.PlainText;
                m.content = quote;
                m.userID = this.chooseAny([...userIDs, 'me']);
                lastTimeStamp = this.getTimeAfter(lastTimeStamp);
                m.timestamp = lastTimeStamp;
                m.threadID = threadID;
                return m;
            })
            .takeWhile(m => m.timestamp < Date.now())
            .pairwise()
            .flatMap((pair: Message[]) => {
                if (pair.length === 1) {
                    pair[0].isLocalLast = true;
                    pair[0].isNewDay = true;
                    return Observable.of(pair[0]);
                }

                const curr = pair[0];
                const next = pair[1];
                if (curr.userID !== next.userID) {
                    curr.isLocalLast = true;
                }
                if (new Date(curr.timestamp).getDate() !== new Date(next.timestamp).getDate()) {
                    next.isNewDay = true;
                }
                return Observable.of(curr);
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
                thread.userIds = [thread.id];
                return thread;
            });
    }


    getMessages(threadID: string): Message[] {
        return this.smsRepo[threadID];
    }

    getThreads(): Thread[] {
        return Object.values(this.threadRepo);
    }
}
