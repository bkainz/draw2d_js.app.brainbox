var raspi={

    gpio:{
        values:{

        },
        init:function(socket){
            socket.on("gpo:change", function(msg){
                raspi.gpio.values[msg.pin]=msg.value;
            });
        },
        set: function(pin, value){
            socket.emit('gpi:set', {
                pin:pin,
                value:value
            });
        },
        get:function(pin){
            return !!raspi.gpio.values[pin];
        }
    }
};