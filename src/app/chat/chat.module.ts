import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MessageComponent } from './thread/message/message.component';
import { ThreadComponent } from './thread/thread.component';
import { ThreadsComponent } from './threads/threads.component';
import { ChatComponent } from './chat.component';
import { RichContentComponent } from './thread/rich-content/rich-content.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
  ],
  declarations: [MessageComponent, ThreadComponent, ThreadsComponent, ChatComponent, RichContentComponent, ProfileSettingsComponent, ContactInfoComponent],
  exports: [MessageComponent, ThreadComponent, ThreadsComponent, ChatComponent, RichContentComponent, ProfileSettingsComponent, ContactInfoComponent],
})
export class ChatModule { }
