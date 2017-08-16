import http         from 'http';
import express      from 'express';
import * as Socket  from 'socket.io';
import ClientManager from './client-manager';
import Handlers     from './handlers';

const DEFAULT_PORT  = 4000;
let app             = express();
let server          = http.createServer(app);
let io              = Socket(server);

// return any file in the build dir except server.js
app.use('/', function (req, res, next) {
    if (req.originalUrl === '/server.js') {
        return res.status(403).end('403 Forbidden');
    }
    return res.sendFile(__dirname + req.originalUrl);
});

app.server.listen(process.env.PORT || DEFAULT_PORT, () => {
    console.log(`Started on port ${app.server.address().port}`);
});

export default app;