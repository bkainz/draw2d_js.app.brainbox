var conf= {
    fileSuffix: ".brain",

    designer: {
        url:null
    },

    backend: {
        oauth: "backend/oauth",
        isLoggedIn: "backend/isLoggedIn",
        file: {
            list:  "backend/file/list",
            get :  "backend/file/get",
            del :  "backend/file/delete",
            save:  "backend/file/save",
            rename:"backend/file/rename",
            image: "backend/file/image"
        },
        // registry of RF24 registered devices. Only available if we use
        // a node.js server and a connected RF24 receiver (e.g. Raspi or arduino with a RF24 receiver)
        //
        bloc: {
            list: "backend/bloc/list"
        }
    },

    shapes: {
        url: "assets/shapes/"
    },
    issues: {
        url: "https://github.com/freegroup/draw2d_js.shapes/issues/new"
    },
    color:{
       high: "#C21B7A",
       low:  "#0078F2"
    }
};
