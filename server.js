var express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http').Server(app),
    https = require('https'),
    io = require('socket.io')(http),
    device = require('express-device'),
    router = express.Router();

app.use(device.capture());
app.enable('trust proxy');

// app.use(function (req, res, next) {
//     if (req.secure) {
//         // request was via https, so do no special handling
//         next();
//     } else {
//         // request was via http, so redirect to https
//         res.redirect('https://' + req.headers.host + req.url);
//     }
// });

app.use(router);
app.use(express.static(__dirname + '/client'));

router.get('/', function (req, res) {
    console.log('\x1b[35m', req.device.type);

    if (req.device.type == 'phone') {
        res.redirect('/photo');
        // res.sendFile(__dirname + '/client/photo/index.html');
    }

    res.sendFile(__dirname + '/client/index.html');
});

router.get('/photo', function (req, res) {
    console.log('\x1b[35m', req.device.type);

    if (req.device.type != 'phone') {
        res.redirect('/');
        // res.sendFile(__dirname + '/client/index.html');
    }

    res.sendFile(__dirname + '/client/photo/index.html');
});

io.on('connection', function (socket) {
    console.log('\x1b[32m', 'a user connected');

    socket.on('disconnect', function () {
        console.log('\x1b[31m', 'user disconnected');
    });

    socket.on('photo flick', function (data) {
        io.emit('photo flick', data);
    });
});

http.listen(process.env.PORT || 8888, function () {
    console.log('listening on *:8888');
});

// Reset = "\x1b[0m"
// Bright = "\x1b[1m"
// Dim = "\x1b[2m"
// Underscore = "\x1b[4m"
// Blink = "\x1b[5m"
// Reverse = "\x1b[7m"
// Hidden = "\x1b[8m"

// FgBlack = "\x1b[30m"
// FgRed = "\x1b[31m"
// FgGreen = "\x1b[32m"
// FgYellow = "\x1b[33m"
// FgBlue = "\x1b[34m"
// FgMagenta = "\x1b[35m"
// FgCyan = "\x1b[36m"
// FgWhite = "\x1b[37m"

// BgBlack = "\x1b[40m"
// BgRed = "\x1b[41m"
// BgGreen = "\x1b[42m"
// BgYellow = "\x1b[43m"
// BgBlue = "\x1b[44m"
// BgMagenta = "\x1b[45m"
// BgCyan = "\x1b[46m"
// BgWhite = "\x1b[47m"