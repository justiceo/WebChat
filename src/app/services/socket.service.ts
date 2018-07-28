import { Injectable } from "@angular/core";

import { CacheService } from "./cache.service";

@Injectable()
export class SocketService {
  socket: SocketIO.Socket;
  readonly TokenKey = "auth-token";
  constructor(private cache: CacheService) {}

  isClientAuthed(): boolean {
    return this.cache.get(this.TokenKey) != null;
  }

  requestToken(): void {}

  requestRoomAccess(): void {}

  onToken(token: string): void {}

  onRoomAuthed(token: string): void {}

  onInactive(): void {}
}
