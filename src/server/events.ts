export enum Event {
  // generic socket.io events
  Connect = "connect",
  Connection = "connection",
  Disconnect = "disconnect", // Fired upon disconnection.
  Disconecting = "disconnecting", // Fired when the client is going to be disconnected (but hasn't left its rooms yet).
  Error = "error", // Fired when an error occurs.

  // custom events
  TokenRequest = "tokenRequest", // received from clients to obtain token
  Token = "token", // emitted by server with generated token
  Paired = "paired",
  Suspend = "suspend",
  ThreadsRequest = "threadsRequest",
  Threads = "threads",
}

// Handler returns true if socket event was successfully handled, false otherwise.
export type Handler = (socket: SocketIO.Socket, ...args: any[]) => boolean;
