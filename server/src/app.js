let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/handshake', (req, res) => {
    console.log('handshake req');
    if(Object.values(io.sockets.sockets).map(s => s.cldata.uname).includes(req.query.uname)) {
        console.log('handshake bad'); return res.sendStatus(403);
    }
    console.log('handshake good'); return res.sendStatus(200);
});

function handshake(socket, next) {
    console.log('default: connection handshake: ' + JSON.stringify(socket.handshake.query.uname));
    if(socket.handshake.query && socket.handshake.query.uname && !Object.values(io.sockets.sockets).map(s => s.cldata.uname).includes(socket.handshake.query.uname)) {
        socket.cldata = {};
        socket.cldata.uname = socket.handshake.query.uname;
        next();
    } else { next(new Error()); }
}

io.use(handshake);
io.on('connection', socket => {
    console.log('default: ' + socket.cldata.uname + ' connected!');

    socket.join('default');

    socket.emit('current-sessions', Object.values(io.nsps).filter(nsp => nsp.cldata).map(nsp => {
        return { sname: nsp.cldata.sname, owner: nsp.cldata.owner }
    }));

    socket.on('create-session', nspId => createNsp(io, nspId, socket.cldata.uname));

    socket.on('disconnect', () => {
        console.log('default: ' + socket.cldata.uname + ' disconnected!');
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

        console.log('Created Session: ' + nspId);

        nsp.use((socket, next) => {
            console.log('nsp: connection handshake: ' + JSON.stringify(socket.handshake.query.uname));
            if(socket.handshake.query && socket.handshake.query.uname) {
                socket.cldata = {};
                socket.cldata.uname = socket.handshake.query.uname;
                next();
            } else { next(new Error()); }
        });

        nsp.on('connection', socket => {
            console.log('nsp: ' + socket.cldata.uname + ' connected!');
            socket.broadcast.emit('new-user', { 'usname': socket.cldata.uname, 'perm': socket.cldata.uname === nsp.cldata.owner });
            socket.emit('curent-users', Object.values(nsp.sockets).map(
                s => { return { uname: s.cldata.uname, owner: s.cldata.uname === nsp.cldata.owner }; }
            ));

            socket.on('disconnect', () => {
                console.log('nsp: ' + socket.cldata.uname + ' disconnected!');
                socket.removeAllListeners();
            });
        });

    }
}

let PORT = process.env.PORT || 4213;
http.listen(PORT, () => {
    console.log('Listening on: ' + PORT);
});