var express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    io = require('socket.io')(https),
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

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/photo', function (req, res) {
    res.sendFile(__dirname + '/client/photo.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('photo post', function (data) {
        io.emit('photo post', msg);
    });
});

// https.createServer(httpsOptions, app).listen(process.env.PORT || 3000, function () {
//     console.log('listening on *:3000');
// });

app.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});
