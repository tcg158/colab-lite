let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.use(express.static('public'));

io.use((socket, next) => {
    console.log('Connection Handshake: ' + JSON.stringify(socket.handshake.query.username));
    if(socket.handshake.query && socket.handshake.query.username) {
        socket.cldata = {};
        socket.cldata.username = socket.handshake.query.username;
        next();
    } else { next(new Error()); }
});

io.on('connection', socket => {
    console.log("default: " + socket.cldata.username + " connected!");

    socket.on("disconnect", () => {
        console.log("default: " + socket.cldata.username + " disconnected!");
        socket.removeAllListeners();
    });
});

let PORT = process.env.PORT || 4213;
http.listen(PORT, () => {
    console.log('Listening on: ' + PORT);
});