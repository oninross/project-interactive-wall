var express = require('express'),
    app = require('express')(),
    fs = require('fs'),
    http = require('http').Server(app),
    https = require('https'),
    io = require('socket.io')(http),
    // io = require('socket.io')(https),
    httpsOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };

app.use(express.static(__dirname + '/client'));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('photo flick', function (data) {
        io.emit('photo flick', data);
    });
});

// https.createServer(httpsOptions, app).listen(process.env.PORT || 8888, function () {
//     console.log('listening on *:8888');
// });

http.listen(process.env.PORT || 8888, function () {
    console.log('listening on *:8888');
});
