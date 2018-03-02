import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {CacheService} from './cache.service';
import {ChatModule} from './chat/chat.module';
import {DataService} from './data.service';
import {HttpHandlerService} from './http_handler.service';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpModule,
    ChatModule,
  ],
  providers: [CacheService, DataService, HttpHandlerService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
