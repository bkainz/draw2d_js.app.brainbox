// This configuration file will be overridden if the application
// is provided by a node.js server. In this case we store all
// circuits and shapes on the local node.js server instead of
// using the global available repository.
// Check the special route in the ./server/main.js for this.
//
// This is useful if you want run the DigitalTrainingStudio local on
// RaspberryPi or another IoT device
//
//
var conf={
    fileSuffix : ".brain",
    designer: {
        url:"http://freegroup.github.io/draw2d_js.app.shape_designer/"
    },
    backend: {
        oauth     : "http://draw2d.org/backend/oauth2.php",
        isLoggedIn: "http://draw2d.org/backend/isLoggedIn.php",
        file:{
            list  : "http://draw2d.org/backend/file_list.php",
            get   : "http://draw2d.org/backend/file_get.php",
            del   : "http://draw2d.org/backend/file_delete.php",
            save  : "http://draw2d.org/backend/file_save.php",
            image : "http://draw2d.org/backend/file_image.php"
        }
    },
    shapes :{
        url: "http://freegroup.github.io/draw2d_js.shapes/assets/shapes/"
    },
    issues: {
        url: "https://github.com/freegroup/draw2d_js.shapes/issues/new"
    }
};
