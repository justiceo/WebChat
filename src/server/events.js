module.exports = {
    CONNECTION: "connection",
    TOKEN_REQUEST: "tokenRequest",  // received from clients to obtain token
    TOKEN_REFRESH: "tokenRefresh",  // received from clients (with old tokens) for new ones
    REFRESH_FAIL: "refreshFail",    // emitted by server when previous token couldn't be validated
    TOKEN: "token",                 // emitted by server with generated token
    TEST_AUTH: "testAuth",          // received from clients wishing to test out tokens
    TEST_AUTH_FAIL: "testAuthFail", // emitted by server when testAuth is invalid
    TEST_AUTH_PASS: "testAuthPass", // emitted by server when testAuth is valid
    TOKEN_VALIDATE: "tokenValidate",// issued by mobile client to validate qr code
    ROOM_AUTHED: "roomAuthed",      // emitted by server to webClients signaling approval of qr code
    OTHER_SESSION: "otherActiveSession",    // emitted by server when there's a new socket with same client id
    INVALID_CLIENT: "invalidClient",        // emitted by server or browser when client doesn't support websockets or ismobile browser
}