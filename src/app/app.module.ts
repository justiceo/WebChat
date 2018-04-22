import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { QRCodeModule } from 'angular2-qrcode';

import { AppComponent } from './app.component';
import { CacheService } from './services/cache.service';
import { ChatModule } from './chat/chat.module';
import { DataService } from './services/data.service';
import { HttpHandlerService } from './services/http_handler.service';
import { AuthComponent } from './auth/auth.component';


@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    QRCodeModule,
    HttpModule,
    ChatModule,
  ],
  providers: [CacheService, DataService, HttpHandlerService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
