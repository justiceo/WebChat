module.exports = {
  // socket.io events
  CONNECT: "connect",
  CONNECTION: "connection",
  DISCONNECT: "disconnect", // Fired upon disconnection.
  DISCONNECTING: "disconnecting", // Fired when the client is going to be disconnected (but hasn't left its rooms yet).
  ERROR: "error", // Fired when an error occurs.

  // socket.io (client only events)
  CONNECT_ERROR: "connect_error",
  CONNECT_TIMEOUT: "connect_timeout",
  RECONNECT: "reconnect",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECTING: "reconnecting",
  RECONNECT_ERROR: "reconnect_error",
  RECONNECT_FAILED: "reconnect_failed",

  // custom events
  TOKEN_REQUEST: "tokenRequest", // received from clients to obtain token
  TOKEN_REFRESH: "tokenRefresh", // received from clients (with old tokens) for new ones
  REFRESH_FAIL: "refreshFail", // emitted by server when previous token couldn't be validated
  TOKEN: "token", // emitted by server with generated token
  TEST_AUTH: "testAuth", // received from clients wishing to test out tokens
  TEST_AUTH_FAIL: "testAuthFail", // emitted by server when testAuth is invalid
  TEST_AUTH_PASS: "testAuthPass", // emitted by server when testAuth is valid
  TOKEN_VALIDATE: "tokenValidate", // issued by mobile client to validate qr code
  ROOM_AUTHED: "roomAuthed", // emitted by server to webClients signaling approval of qr code
  OTHER_SESSION: "otherActiveSession", // emitted by server when there's a new socket with same client id
  INVALID_CLIENT: "invalidClient", // emitted by server or browser when client doesn't support websockets or ismobile browser
  CONV_REQUEST: "convRequest", // emitted by web client to get the latest conversations
  CONV_DATA: "convData", // emitted by mobile client in response to conv_request
  MSG_RECEIVE: "msgReceive",
  MSG_SENT: "msgSent",
  MSG_DELIVERED: "msgDelivered",
  MSG_DELETE: "msgDelete",
  CONTACT_REQUEST: "contactRequest",
  CONTACt_INFO: "contactInfo",
  SEND_MSG: "sendMSG",

  AUTH_ERROR: "authError"
};
