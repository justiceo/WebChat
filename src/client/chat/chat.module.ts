import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";

import { SingleThreadComponent } from "./single-thread/single-thread.component";
import { ThreadsListComponent } from "./threads-list/threads-list.component";
import { ChatComponent } from "./chat.component";
import { TimeSince } from "../pipes/timesince.pipe";

@NgModule({
  imports: [CommonModule, FlexLayoutModule],
  declarations: [
    SingleThreadComponent,
    ThreadsListComponent,
    ChatComponent,
    TimeSince
  ],
  exports: [
    SingleThreadComponent,
    ThreadsListComponent,
    ChatComponent,
    TimeSince
  ]
})
export class ChatModule {}
