import { RedisClient } from "redis";
import { Event } from "./events";

// Handler returns true if socket event was successfully handled, false otherwise.
interface Handler {
  (socket: SocketIO.Socket, ...args: any[]): boolean;
}

export default class EventHandler {
  eventMap: Map<Event, Handler>;

  constructor(db: RedisClient) {}

  registerEvents(server: SocketIO.Server) {
    server.on(Event.Connection, (socket: SocketIO.Socket) => {
      this.eventMap.forEach((handler: Handler, event: Event) => {
        socket.on(event, (...args: any[]) => {
          handler(socket, args);
        });
      });
    });
  }
}
