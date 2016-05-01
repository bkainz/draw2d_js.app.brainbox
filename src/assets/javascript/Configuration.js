var conf={
    fileSuffix : ".circuit"
};

if (window.location.hostname === "localhost") {
    conf.backend= "http://localhost/~andherz/backend/";
}
else{
    conf.backend= "http://draw2d.org/backend/";
}


