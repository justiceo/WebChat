import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SingleThreadComponent } from './single-thread/single-thread.component';
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
  declarations: [SingleThreadComponent, ThreadsListComponent, ChatComponent, ProfileSettingsComponent, ContactInfoComponent, TimeSince],
  exports: [ SingleThreadComponent, ThreadsListComponent, ChatComponent, ProfileSettingsComponent, ContactInfoComponent, TimeSince],
})
export class ChatModule { }
