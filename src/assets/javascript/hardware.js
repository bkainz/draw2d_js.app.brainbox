/**
 * Registry of all available devices (connected via RF24 adapter) and of the hub GPIO pins.
 * The hub could be an RaspberryPi or and Arduino.
 *
 * The "hub" is the receiver for the connected devices and expose its own
 * GPIO pins as well.
 *
 */
var hardware=(function(){
    var eventSubscriptions = {}; // event listener to the registry

    var values= {};
    var blocs = [];
    var socket= null;
    var fireEvent = function(event, args)
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
            }
        }
    };

    return {
        /**
         * Init the listener for the socket.io events
         * Events could be
         *  - changes on the GPIO pins
         *  - new registered devices (blocs)
         *  - unregister of devices (blocs)
         *  - provides events of devices (blocs)
         *
         * @param s
         */
        init: function (s) {
            socket = s;
            socket.on("gpo:change", function (msg) {
                values[msg.pin] = !!parseInt(msg.value);
            });
            socket.on("bloc:value", function (msg) {
               values[msg.blocId] = !!parseInt(msg.value);
            });
            socket.on("bloc:register", function (msg) {
                blocs= blocs.filter(function(bloc) {
                    return bloc.blockId != msg.blocId;
                });
                blocs.push(msg);
                fireEvent("bloc:register",msg );
            });
            socket.on("bloc:unregister", function (msg) {
                blocs= blocs.filter(function(bloc) {
                    return bloc.blockId != msg.blocId;
                });
                fireEvent("bloc:unregister",msg );
            });

            // load all registered devices from the node.js server if any connected
            //
            socket.on('connect',function() {
                if (conf.backend.bloc.list !== null) {
                    $.ajax({url: conf.backend.bloc.list,method: "GET"})
                        .done(function (content) {
                            blocs = content;
                        });
                }
            });
        },
        gpio: {
            set: function (pin, value) {
                socket.emit('gpi:set', {
                    pin: pin,
                    value: value
                });
            },
            get: function (pin) {
                return values[pin];
            }
        },
        bloc: {
            set: function (blocId, value) {
                socket.emit('bloc:set', {
                    blocId: blocId,
                    value: value
                });
            },
            get: function (blocId) {
                return values[blocId];
            },
            connected: function () {
                return blocs;
            },
            /**
             * @method
             * Attach an event handler function to "bloc" based events
             *
             * possible events are:<br>
             * <ul>
             *   <li>bloc:register</li>
             *   <li>bloc:unregister</li>
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
                    var check = function( callback ) { return callback !== eventOrFunction; };
                    for(var event in this.eventSubscriptions ){
                        eventSubscriptions[event] =$.grep(eventSubscriptions[event], check);
                    }
                }

                return this;
            }
        }
    };
})();

// deprecated
var raspi = hardware;

