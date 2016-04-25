var conf=null;
if (window.location.hostname === "localhost") {
    conf = {
        githubClientId: "f2b699f46d49387556bc",
        githubAuthenticateCallback: "http://localhost/~andherz/githubCallback.php?app=circuit&code="
    };
}
else{
    conf = {
        githubClientId: "dd03c01c22566f3490a2",
        githubAuthenticateCallback: "http://www.draw2d.org/githubCallback.php?app=circuit&code="
    };
}

conf.fileSuffix  = ".dsim";
conf.defaultUser = "freegroup";
conf.defaultRepo = "draw2d_js.app.digital_training_studio";
conf.defaultPath  = "circuits";
