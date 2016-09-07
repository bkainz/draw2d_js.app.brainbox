var prompt = require('prompt');
var serialport = require('serialport');
var SerialPort = serialport;
var parsers = serialport.parsers;
var arduino    = null;

// indicies within the event array
//
const DEVICE_ID  = 0, // which device has fired the event
      DEVICE_NR  = 1, // the number of the device. Can be between 1-99
      DEVICE_TYPE= 2, // which kind of device has fired the event
      EVENT      = 3, // which kind of event
      VALUE      = 4; // optional "value" of the event. Not provided by all kind of events


// configuration
//
var invalidationPeriod = 5; // [seconds]. Remove a device from the registry if we didn't receive a keep alive during this period
var devices = [];            // [strings]. Id's of all registered devices which has send a valid "keep alive"
var eventSubscriptions = {}; // event listener to the registry


var NodeTTL = require( "node-ttl" );
var cache = new NodeTTL({
    ttl:invalidationPeriod,
    checkPeriode:invalidationPeriod
});


cache.on("expired", function( key, container ){
    devices= devices.filter(function(i) {
        return i != container.key;
    });
    fireEvent("unregister", container.value);
});

// called every time an event if fired by a RF24 device
// The device Id and type ist stored in an registry and the HTML5 WebApp can retrieve this device
// for selection and management
//
function processEvent(data)
{
    console.log(data);
    var id   = data[DEVICE_ID];
    var nr   = data[DEVICE_NR];
    var event= data[EVENT];
    switch(event)
    {
        case "alive":
            var device = {
                blocId:    id,
                blocNr:    nr,
                blocType:  data[DEVICE_TYPE]
            };
            // add it to the TTL cache
            //
            if(devices.indexOf(id)===-1) {
                cache.push(id, device);
                devices.push(id);
                fireEvent("register", device);
            }
            // ping the TTL cache that the entry didn't get invalid
            //
            else{
                cache.push(id, device);
            }
            break;
        case "value":
            fireEvent("value", {
                blocId:    id,
                blocType:  data[DEVICE_TYPE],
                event:     event,
                value:     data[VALUE]
            });
            break;
    }
 }



/**
 * @method
 * Execute all handlers and behaviors attached to the registry for the given event type.
 *
 *
 * @param {String} event the event to trigger
 * @param {Object} [args] optional parameters for the triggered event callback
 *
 * @since 5.0.0
 */
function fireEvent(event, args)
{
    if (typeof eventSubscriptions[event] === 'undefined') {
        return;
    }

    var subscribers = eventSubscriptions[event];
    for (var i=0; i<subscribers.length; i++) {
        try{
            subscribers[i]( args);
        }
        catch(exc){
            console.log(exc);
            console.log(subscribers[i]);
            debugger;
        }
    }
}


module.exports = {

    // Init the device registry with all available RF24 devices which has send
    // a "keep alive" to the mast device which is connected via USB to the PC or raspi
    //
    init:function(onSuccess){
        var serialPortCandidates = [];
        SerialPort.list(function (err, ports) {
            // select the ports by the manufacture name
            //
            ports.forEach(function(port) {
                if(port.manufacturer && port.manufacturer.startsWith("Arduino")){
                    serialPortCandidates.push(port);
                }
            });
            // ask the user which one to use if more than one is possible
            //
            if(serialPortCandidates.length>0){
                console.log("------------------------------------------------");
                console.log("  Found some Arduinos to connect to brainbox.");
                console.log("  Please select the one to use or enter '0' if ");
                console.log("  you didn't want use any.");
                console.log("------------------------------------------------");
                console.log("    0 -> do not connect any");
                serialPortCandidates.forEach(function(port,i) {
                    console.log("    "+(i+1)+" -> "+port.comName);
                });

                prompt.get(['serialPort'], function (err, result) {
                    if (err) {
                        console.log("start server without serial connection");
                    }
                    else{
                        var index = parseInt(result.serialPort);
                        if(index===0){
                            onSuccess();
                        }
                        else{
                            index -=1;
                            if (index >= 0 && index < serialPortCandidates.length) {
                                arduino = new SerialPort(serialPortCandidates[index].comName,{
                                    baudRate: 57600,
                                    parser: parsers.readline('\r\n')
                                });
                                arduino.on('open', function(){
                                    console.log("Serial Port '"+serialPortCandidates[index].comName+"' to Arduino opend successfully");
                                    arduino.on('data', function(data){
                                        data = (""+data).split("|");
                                        processEvent(data);
                                    });
                                });
                                onSuccess();
                            }
                            else{
                                console.log("invalid selection. Starting server without any serial connection");
                                onSuccess();
                            }
                        }
                    }
                });

            }
            // start the server without an Arduino connection
            //
            else{
                onSuccess();
            }
        });
    },

    /**
     * @method
     * Attach an event handler function for one or more events to the registry.
     * To remove events bound with .on(), see {@link #off}.
     *
     * possible events are:<br>
     * <ul>
     *   <li>valueChange</li>
     * </ul>
     *
     * @param {String}   event One or more space-separated event types
     * @param {Function} callback A function to execute when the event is triggered.
     *
     * @since 5.0.0
     */
    on: function(event, callback)
    {
        var events = event.split(" ");
        for(var i=0; i<events.length; i++){
            if (typeof eventSubscriptions[events[i]] === 'undefined') {
                eventSubscriptions[events[i]] = [];
            }
            eventSubscriptions[events[i]].push(callback);
        }
        return this;
    },

    /**
     * @method
     * The .off() method removes event handlers that were attached with {@link #on}.<br>
     * Calling .off() with no arguments removes all handlers attached to the registry.<br>
     *
     * @param {String|Function} eventOrFunction the event name of the registered function
     * @since 5.0.0
     */
    off: function( eventOrFunction)
    {
        if(typeof eventOrFunction ==="undefined"){
            eventSubscriptions = {};
        }
        else if( typeof eventOrFunction === 'string'){
            eventSubscriptions[eventOrFunction] = [];
        }
        else{
            for(var event in this.eventSubscriptions ){
                eventSubscriptions[event] =$.grep(eventSubscriptions[event], function( callback ) { return callback !== eventOrFunction; });
            }
        }

        return this;
    },

    get: function()
    {

    },

    getAll:function()
    {
        var result= cache.get(devices);
        if(Array.isArray(result)) {
            return result;
        }
        if(result===null){
            return [];
        }
        return [result];
    }

};
