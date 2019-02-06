import { Component, OnInit, Input } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { bufferTime } from "rxjs/operators";

import { DataService } from "../../services/data.service";
import { MessageContentType, Message } from "../../model/message";
import { Thread } from "../../model/thread";

@Component({
  selector: "wc-single-thread",
  templateUrl: "./single-thread.component.html",
  styleUrls: ["./single-thread.component.scss"]
})
export class SingleThreadComponent implements OnInit {
  messages: Message[] = [];
  _thread: Thread;

  get thread() {
    return this._thread;
  }

  @Input()
  set thread(t: Thread) {
    if (!t) {
      return;
    }
    this._thread = t;
    this.messages = [];
    this.dataService.getMessagesAsyc(t.id);
  }

  newMessage: string;
  constructor(private dataService: DataService) {
    this.dataService.getMessagesSubj().subscribe((m: Message) => {
       // TODO: you would need this.addOrUpdate() for when changing message status.
      this.messages.push(m);
    });
  }

  ngOnInit() {}

  send() {
    if (!this.newMessage) {
      return;
    }
    this.dataService.sendMessageAsync(this._thread.id, this.newMessage);
    this.newMessage = "";
  }

  addOrUpdate(e: Message) {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].id === e.id) {
        // Implement a generic obj.Copy if all the fields need to be copied.
        Message.copy(e, this.messages[i]);
        return;
      }
    }
    this.messages.push(e);
  }
}

// scroll to bottom of div: https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div
