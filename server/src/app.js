let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

io.on('connection', socket => {

});

http.listen(3000, () => {
    console.log('Listening');
});