import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { QRCodeModule } from "angular2-qrcode";

import { AppComponent } from "./app.component";
import { CacheService } from "./services/cache.service";
import { ChatModule } from "./chat/chat.module";
import { DataService } from "./services/data.service";
import { AuthService } from "./services/auth.service";
import { HttpHandlerService } from "./services/http_handler.service";
import { AuthComponent } from "./auth/auth.component";

@NgModule({
  declarations: [AppComponent, AuthComponent],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    QRCodeModule,
    HttpClientModule,
    ChatModule
  ],
  providers: [CacheService, DataService, HttpHandlerService, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {}
