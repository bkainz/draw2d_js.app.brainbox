// running in a none node.js/socket.io backend. Just a simple WebServer
// In this case we provide a Socket.io mock object without any functionality
//
function io(){
    return {
        emit:function(){}
    };
}