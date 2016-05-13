// Load the http module to create an http server.
var express =require('express');
var app  = express();

var http = require('http').Server(app);
var io   = require('socket.io')(http);
var gpio = require("gpio");
var port = 7400;

app.use(express.static('dist'));

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('gpi:set', function(msg){
        console.log('message: ' + JSON.stringify(msg));
    });
});

http.listen(port, function(){
    console.log('listening on *:'+port);
});
