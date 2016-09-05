var fs   = require('fs');
var glob = require("glob");
var path = require('path');

var brainDir = process.env.HOME+ "/.brainbox";
try {
    if (!fs.existsSync(brainDir)){
        fs.mkdirSync(brainDir);
    }

    // copy some template/examples files into the user dir
    //
    glob(__dirname+"/./../templates/*", {}, function (er, files) {
        files.forEach(function(file){
            var target = brainDir+"/"+path.basename(file);
            if(!fs.existsSync(target)) {
                fs.createReadStream(file).pipe(fs.createWriteStream(target));
            }
        });
    });

} catch(e) {
    console.log(e)
}


module.exports = brainDir;