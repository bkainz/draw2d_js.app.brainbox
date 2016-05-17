#!/usr/bin/env node
// Load the http module to create an http server.
var express =require('express');
var os   = require('os');
var fs   = require('fs');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var gpio = require("gpio");
var glob = require("glob");
var path = require('path');
var bodyParser = require('body-parser');

// determine the ip address of the running node server
//
var ifaces = os.networkInterfaces();
var address ="*";
for (var dev in ifaces) {
    var iface = ifaces[dev].filter(function(details) {
        return details.family === 'IPv4' && details.internal === false;
    });
    if(iface.length > 0) address = iface[0].address;
}

// get the local storage for files in the home directory of the
// current user
//
var circuitDir = process.env.HOME+ "/.digitalstudio";
try {fs.mkdirSync(path);} catch(e) {}


var port = 7400;

// provide the DigitalTrainingStudio WebApp with this very simple
// HTTP server. good enough for an private raspi access
//
app.use('/assets/settings', express.static(__dirname+'/settings'));
app.use('/assets/shapes'  , express.static(__dirname+'/shapes'));
app.use(express.static(__dirname+'/../../dist'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/backend/isLoggedIn', function (req, res) {
    res.send('true');
});

app.get('/backend/file/list', function (req, res) {
    glob(circuitDir+"/*.circuit", {}, function (er, files) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify( {files:files.map(function(f){f= path.basename(f,".circuit");return {id:f+".circuit", name: f};})}));
    });
});

app.post('/backend/file/get', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    fs.createReadStream(circuitDir+"/"+req.body.id).pipe(res);
});

app.post('/backend/file/save', function (req, res) {
    fs.writeFile(circuitDir + "/" + req.body.id + ".circuit", req.body.content, function (err) {
        res.send('true');
    });
});


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
    socket.on('gpi:set', function(msg){
        console.log(JSON.stringify(msg));
        var pin = pins[msg.pin];
        pin.set(1-msg.value);
    });
});

http.listen(port, function(){
    console.log('listening on http://'+address+':'+port+'/');
});
