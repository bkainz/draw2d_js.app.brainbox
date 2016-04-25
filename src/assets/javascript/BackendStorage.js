BackendStorage = Class.extend({

    /**
     * @constructor
     * 
     */
    init:function(){
        this.octo=null;
        this.repositories = null;
        this.currentRepository = null;
        this.currentPath = "";
        this.currentFileHandle = null;
    },
    

    connect: function(token, callback)
    {
        var _this = this;
        this.octo = new Octokat({
            token: token
        });

        this.octo.user.fetch(function(param0, user){
            if(user){
               _this.octo.repos(conf.defaultUser, conf.defaultRepo).fetch().then(function(repo){
                   _this.currentRepository = repo;
                   _this.currentPath = conf.defaultPath;
                    callback(true);
               });

            }
            else {
                callback(false);
            }
        });
    },


    load: function(repository, path, successCallback)
    {
        var _this = this;
        // anonymous usage. Not authenticated
        //
        if (this.octo === null) {
            var octo = new Octokat();
            var repo = octo.repos(conf.defaultUser, conf.defaultRepo);
            repo.contents(path).read()
                .then(function(contents) {
                    successCallback(contents);
                });
        }
        // Authenticated usage
        //
        else {
            this.octo.user.repos.fetch(function (param, repos) {
                _this.repositories = repos;
                _this.currentRepository = $.grep(_this.repositories, function (repo) {
                    return repo.fullName === repository;
                })[0];
                _this.currentPath = _this.dirname(path);
                _this.currentRepository
                    .contents(path)
                    .fetch()
                    .then(function (info) {
                        _this.currentFileHandle = {
                            path: path,
                            title: _this.basename(path),
                            sha: info.sha,
                            content: atob(info.content)
                        };
                        successCallback(_this.currentFileHandle.content);
                    });
            });
        }
    },


    dirname: function(path)
    {
        if (path.length === 0)
            return "";

        var segments = path.split("/");
        if (segments.length <= 1)
            return "";
        return segments.slice(0, -1).join("/");
    },


    basename:function(path)
    {
        return path.split(/[\\/]/).pop();
    }

});