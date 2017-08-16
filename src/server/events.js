module.exports = {
    CONNECTION: "connection",
    TOKEN_REQUEST: "tokenRequest",  // received from clients to obtain token
    TOKEN_REFRESH: "tokenRefresh",  // received from clients (with old tokens) for new ones
    TOKEN: "token",                 // emitted by server with generated token
    TEST_AUTH: "testAuth",          // received from clients wishing to test out tokens
    TEST_AUTH_FAIL: "testAuthFail", // emitted by server when testAuth is invalid
    TEST_AUTH_PASS: "testAuthPass", // emitted by server when testAuth is valid
    TOKEN_VALIDATE: "tokenValidate",// issued by mobile client to validate qr code
    ROOM_AUTHED: "roomAuthed",      // emitted by server to webClients signaling approval of qr code
}