import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ThreadComponent } from './thread/thread.component';
import { ThreadsListComponent } from './threads-list/threads-list.component';
import { ChatComponent } from './chat.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { TimeSince } from '../timesince.pipe';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
  ],
  declarations: [ThreadComponent, ThreadsListComponent, ChatComponent, ProfileSettingsComponent, ContactInfoComponent, TimeSince],
  exports: [ ThreadComponent, ThreadsListComponent, ChatComponent, ProfileSettingsComponent, ContactInfoComponent, TimeSince],
})
export class ChatModule { }
