import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

import { ChatModule } from './chat/chat.module';

import { AppComponent } from './app.component';
import { DataService } from './data.service';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    ChatModule,
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
