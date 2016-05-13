#!/usr/bin/env node
// Load the http module to create an http server.
var express =require('express');
var app  = express();

var http = require('http').Server(app);
var io   = require('socket.io')(http);
var gpio = require("gpio");
var port = 7400;

// provide the DigitalTriningsStudio WebApp with this very simple
// HTTP server. good enough for an private raspi access
//
app.use(express.static('./server/html'));

var pins = {
    gpio_1 : gpio.export(1, { direction: "out"}),
    gpio_2 : gpio.export(2, { direction: "out"}),
    gpio_3 : gpio.export(3, { direction: "out"}),
    gpio_4 : gpio.export(4, { direction: "out"}),
    gpio_5 : gpio.export(5, { direction: "out"}),
    gpio_6 : gpio.export(6, { direction: "out"}),
    gpio_7 : gpio.export(7, { direction: "out"}),
    gpio_8 : gpio.export(8, { direction: "out"})
};

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('gpi:set', function(msg){
        var pin = pins[msg.pin];
        pin.set(!!msg.value);
        console.log(JSON.stringify(msg));
    });
});

http.listen(port, function(){
    console.log('listening on *:'+port);
});


