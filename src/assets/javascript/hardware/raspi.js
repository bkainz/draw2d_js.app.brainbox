var raspi={

    gpio:function(pin, value)
    {
        socket.emit('gpi:set', {
            pin:pin,
            value:value
        });
    }
};