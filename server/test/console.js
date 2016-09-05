var serialport = require('serialport');
var SerialPort = serialport;
var parsers = serialport.parsers;


prompt.start();


prompt.get(['username', 'email'], function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Email: ' + result.email);
});

function onErr(err) {
    console.log(err);
    return 1;
}

/*

SerialPort.list(function (err, ports) {
    ports.forEach(function(port) {
        console.log(port.comName);
        console.log(port.manufacturer);
        console.log("---------------");
    });
});

var port = new SerialPort("/dev/tty.usbmodem411",{
    baudRate: 57600,
    parser: parsers.readline('\r\n')
});

port.on('open', function(){
    console.log('Serial Port Opend');
    port.on('data', function(data){
        console.log(""+data);
    });
});
*/