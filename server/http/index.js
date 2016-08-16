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

var fileSuffix = ".brain";
var port       = 7400;
var debug      = false;

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
var brainDir = process.env.HOME+ "/.brainbox";
try {fs.mkdirSync(brainDir);} catch(e) {console.log(e)}


// provide the DigitalTrainingStudio WebApp with this very simple
// HTTP server. good enough for an private raspi access
//
app.use('/assets/settings', express.static(__dirname+'/settings'));
app.use('/assets/shapes'  , express.static(__dirname+'/shapes'));
app.use(express.static(__dirname+'/html'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/backend/isLoggedIn', function (req, res) {
    res.send('true');
});

app.get('/backend/file/list', function (req, res) {
    glob(brainDir+"/*"+fileSuffix, {}, function (er, files) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify( {files:files.map(function(f){f= path.basename(f,fileSuffix);return {id:f+fileSuffix, name: f};})}));
    });
});

app.get('/backend/file/image', function (req, res) {
    var contents = fs.readFileSync(brainDir+"/"+req.param('id'));
    var json = JSON.parse(contents);
    var base64data = json.image.replace(/^data:image\/png;base64,/, '');
    var img = new Buffer(base64data, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });
    res.end(img);
});

app.post('/backend/file/get', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    fs.createReadStream(brainDir+"/"+req.body.id).pipe(res);
});

app.post('/backend/file/rename', function (req, res) {
    fs.rename(brainDir + "/" + req.body.from, brainDir + "/" + req.body.to, function(err){
        res.send('true');
    });
});


app.post('/backend/file/delete', function (req, res) {
    try {
        fs.unlink(brainDir + "/" + req.body.id);
    }
    catch(e){
        console.log(e);
    }
    res.send('true');
});


app.post('/backend/file/save', function (req, res) {
    fs.writeFile(brainDir + "/" + req.body.id.toLowerCase().replace(new RegExp(fileSuffix+"$"), "") + fileSuffix, req.body.content, function (err) {
        res.send('true');
    });
});


var pins = {
    gpi_1  : gpio.export(1,  { direction: "out"}),
    gpi_2  : gpio.export(2,  { direction: "out"}),
    gpi_3  : gpio.export(3,  { direction: "out"}),
    gpi_4  : gpio.export(4,  { direction: "out"}),
    gpi_5  : gpio.export(5,  { direction: "out"}),
    gpi_6  : gpio.export(6,  { direction: "out"}),
    gpi_7  : gpio.export(7,  { direction: "out"}),
    gpi_8  : gpio.export(8,  { direction: "out"}),
    gpo_9  : gpio.export(9,  { direction: "in"}),
    gpo_10 : gpio.export(10, { direction: "in"}),
    gpo_11 : gpio.export(11, { direction: "in"}),
    gpo_12 : gpio.export(12, { direction: "in"}),
    gpo_13 : gpio.export(13, { direction: "in"}),
    gpo_14 : gpio.export(14, { direction: "in"}),
    gpo_15 : gpio.export(15, { direction: "in"}),
    gpo_16 : gpio.export(16, { direction: "in"})
};

// forward the PIN state from the browser to the real GPIO pin
//
io.on('connection', function(socket){
    socket.on('gpi:set', function(msg){
        var pin = pins[msg.pin];
        pin.set(1-msg.value);
        if(debug){console.log(arguments);}
    });
});

// inform the browser if something has changed
//
pins.gpo_9.on("change",  function(val){io.sockets.emit("gpo:change",{pin:"gpo_9", value:val});});
pins.gpo_10.on("change", function(val){io.sockets.emit("gpo:change",{pin:"gpo_10", value:val});});
pins.gpo_11.on("change", function(val){io.sockets.emit("gpo:change",{pin:"gpo_11", value:val});});
pins.gpo_12.on("change", function(val){io.sockets.emit("gpo:change",{pin:"gpo_12", value:val});});
pins.gpo_13.on("change", function(val){io.sockets.emit("gpo:change",{pin:"gpo_13", value:val});});
pins.gpo_14.on("change", function(val){io.sockets.emit("gpo:change",{pin:"gpo_14", value:val});});
pins.gpo_15.on("change", function(val){io.sockets.emit("gpo:change",{pin:"gpo_15", value:val});});
pins.gpo_16.on("change", function(val){io.sockets.emit("gpo:change",{pin:"gpo_16", value:val});});



http.listen(port, function(){
    console.log('+------------------------------------------------------------+');
    console.log('| Welcome to brainbox - the begin of something awesome       |');
    console.log('|------------------------------------------------------------|');
    console.log('| System is up and running. Copy the URL below and open this |');
    console.log('| in your browser: http://'+address+':'+port+'/                |');
    console.log('+------------------------------------------------------------+');
});
