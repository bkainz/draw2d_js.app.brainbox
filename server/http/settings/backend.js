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
            image: "backend/file/image"
        }
    },

    shapes: {
        url: "assets/shapes/"
    },
    issues: {
        url: "https://github.com/freegroup/draw2d_js.shapes/issues/new"
    }
};
