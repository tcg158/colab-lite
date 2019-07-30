let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let logger = require('./logger').logger;

app.use(express.static('public'));

app.get('/handshake', (req, res) => {
    logger.warn('handshake requested');
    if(Object.values(io.sockets.sockets).map(s => s.cldata.uname).includes(req.query.uname)) {
        logger.error('handshake BAD'); return res.sendStatus(403);
    }
    logger.info('handshake GOOD'); return res.sendStatus(200);
});

function handshake(socket, next) {
    logger.info('default connection handshake: ' + JSON.stringify(socket.handshake.query.uname));
    if(socket.handshake.query && socket.handshake.query.uname && !Object.values(io.sockets.sockets).map(s => s.cldata.uname).includes(socket.handshake.query.uname)) {
        socket.cldata = {};
        socket.cldata.uname = socket.handshake.query.uname;
        next();
    } else { next(new Error()); }
}

io.use(handshake);
io.on('connection', socket => {
    logger.info('default user ' + socket.cldata.uname + ' connected!');

    socket.join('default');

    socket.emit('current-sessions', Object.values(io.nsps).filter(nsp => nsp.cldata).map(nsp => {
        return { sname: nsp.cldata.sname, owner: nsp.cldata.owner }
    }));

    socket.on('create-session', nspId => createNsp(io, nspId, socket.cldata.uname));

    socket.on('disconnect', () => {
        logger.info('default user ' + socket.cldata.uname + ' disconnected!');
        socket.removeAllListeners();
    });
});

function createNsp(io, nspId, owner) {
    if(!Object.keys(io.nsps).includes(nspId)) {
        let nsp = io.of(nspId);
        nsp.cldata = {};
        nsp.cldata.sname = nspId;
        nsp.cldata.owner = owner;

        io.emit('new-session', { sname: nsp.cldata.sname, owner: nsp.cldata.owner });

        logger.info('Created Session: ' + nspId);

        nsp.use((socket, next) => {
            logger.info('nsp connection handshake: ' + JSON.stringify(socket.handshake.query.uname));
            if(socket.handshake.query && socket.handshake.query.uname) {
                socket.cldata = {};
                socket.cldata.uname = socket.handshake.query.uname;
                next();
            } else { next(new Error()); }
        });

        nsp.on('connection', socket => {
            logger.info('nsp user ' + socket.cldata.uname + ' connected!');
            socket.broadcast.emit('new-user', { 'usname': socket.cldata.uname, 'perm': socket.cldata.uname === nsp.cldata.owner });
            socket.emit('curent-users', Object.values(nsp.sockets).map(
                s => { return { uname: s.cldata.uname, owner: s.cldata.uname === nsp.cldata.owner }; }
            ));

            socket.on('disconnect', () => {
                logger.info('nsp user ' + socket.cldata.uname + ' disconnected!');
                socket.removeAllListeners();
            });
        });

    }
}

let PORT = process.env.PORT || 4213;
http.listen(PORT, () => {
    logger.info('Listening on: ' + PORT);
});