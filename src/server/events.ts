export enum Event {
  // generic socket.io events
  Connect = "connect",
  Connection = "connection",
  Disconnect = "disconnect", // Fired upon disconnection.
  Disconecting = "disconnecting", // Fired when the client is going to be disconnected (but hasn't left its rooms yet).
  Error = "error", // Fired when an error occurs.

  // custom events
  TOKEN_REQUEST = "tokenRequest", // received from clients to obtain token
  TOKEN_REFRESH = "tokenRefresh", // received from clients (with old tokens) for new ones
  REFRESH_FAIL = "refreshFail", // emitted by server when previous token couldn't be validated
  TOKEN = "token" // emitted by server with generated token
}
