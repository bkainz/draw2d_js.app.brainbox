var raspi=(function(){

    var values= {};
    var socket= null;
    return {
        gpio: {
            init: function (s) {
                socket = s;
                socket.on("gpo:change", function (msg) {
                    values[msg.pin] = msg.value;
                });
            },
            set: function (pin, value) {
                socket.emit('gpi:set', {
                    pin: pin,
                    value: value
                });
            },
            get: function (pin) {
                return !!values[pin];
            }


        }
    };
})();