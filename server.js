var fs = require('fs'),
    app = require('express')(),
    https = require('https').Server(app),
    io = require('socket.io')(https);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});

https.listen(443, function () {
    console.log('listening on *:443');
});
