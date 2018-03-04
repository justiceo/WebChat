import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ThreadComponent } from './thread/thread.component';
import { ThreadsComponent } from './threads/threads.component';
import { ChatComponent } from './chat.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
  ],
  declarations: [ThreadComponent, ThreadsComponent, ChatComponent, ProfileSettingsComponent, ContactInfoComponent],
  exports: [ ThreadComponent, ThreadsComponent, ChatComponent, ProfileSettingsComponent, ContactInfoComponent],
})
export class ChatModule { }
