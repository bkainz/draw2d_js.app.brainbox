FileOpen = Class.extend({

    /**
     * @constructor
     *
     */
    init:function(storage){
        this.storage=storage;

    },

    /**
     * @method
     *
     * Open the file picker and load the selected file.<br>
     *
     * @param {Function} successCallback callback method if the user select a file and the content is loaded
     * @param {Function} errorCallback method to call if any error happens
     *
     * @since 4.0.0
     */
    show: function(successCallback)
    {
        $('#githubFileSelectDialog').modal('show');

        // Select first a ROOT repository if we didn'T have before
        if(this.storage.currentRepository===null) {
            this.fetchRepositories(successCallback);
        }
        // else reopen the already selected directory
        else{
            this.fetchPathContent(this.storage.currentPath, successCallback);
        }
    },

    /**
     * @private
     *
     * @param successCallback
     * @param errorCallback
     * @param abortCallback
     */
    fetchRepositories: function(successCallback)
    {
        var _this = this;

        // fetch all repositories of the related user
        //
        this.storage.octo.user.repos.fetch(function(param, repos){

            repos.sort(function(a, b)
            {
                if ( a.name.toLowerCase() < b.name.toLowerCase() )
                    return -1;
                if ( a.name.toLowerCase() > b.name.toLowerCase() )
                    return 1;
                return 0;
            });

            _this.storage.repositories = repos;
            var compiled = Hogan.compile(
                '         {{#repos}}'+
                '         <a href="#" class="list-group-item repository text-nowrap" data-type="repository" data-id="{{id}}">'+
                '         <span class="fa fa-github"></span>'+
                '         {{{name}}}'+
                '         </a>'+
                '         {{/repos}}'
            );

            var output = compiled.render({
                repos: repos
            });
            console.log("here");
            $("#githubFileSelectDialog .githubNavigation").html($(output));
            $("#githubFileSelectDialog .githubNavigation").scrollTop(0);

            $(".repository").on("click", function(){
                var $this = $(this);
                var repositoryId = $this.data("id");
                _this.storage.currentRepository = $.grep(_this.storage.repositories, function(repo){return repo.id === repositoryId;})[0];
                _this.fetchPathContent("",successCallback);
            });
        });
    },

    fetchPathContent: function( newPath, successCallback )
    {
        var _this = this;

        this.storage.currentRepository.contents(newPath).fetch(function(param, files){
            // sort the reusult
            // Directories are always on top
            //
            files.sort(function(a, b)
            {
                if(a.type===b.type) {
                    if (a.name.toLowerCase() < b.name.toLowerCase())
                        return -1;
                    if (a.name.toLowerCase() > b.name.toLowerCase())
                        return 1;
                    return 0;
                }
                if(a.type==="dir"){
                    return -1;
                }
                return 1;
            });

            _this.storage.currentPath = newPath;
            var compiled = Hogan.compile(
                '         <a href="#" class="list-group-item githubPath" data-type="{{parentType}}" data-path="{{parentPath}}" >'+
                '             <span class="glyphicon glyphicon-menu-left"></span>'+
                '             ..'+
                '         </a>'+
                '         {{#files}}'+
                '           <a href="#" data-draw2d="{{draw2d}}" class="list-group-item githubPath text-nowrap" data-type="{{type}}" data-path="{{currentPath}}{{name}}" data-id="{{id}}" data-sha="{{sha}}">'+
                '              <span class="{{icon}}"></span>'+
                '              {{{name}}}'+
                '           </a>'+
                '         {{/files}}'
            );


            var parentPath =  _this.dirname(newPath);
            var output = compiled.render({
                parentType: parentPath===newPath?"repository":"dir",
                parentPath: parentPath,
                currentPath: _this.storage.currentPath.length===0?_this.storage.currentPath:_this.storage.currentPath+"/",
                files: files,
                draw2d:function(){
                    return this.name.endsWith(conf.fileSuffix);
                },
                icon: function(){
                    if(this.name.endsWith(conf.fileSuffix)){
                        return "fa fa-object-group";
                    }
                    return this.type==="dir"?"fa fa-folder-o":"fa fa-file-o";
                }
            });

            $("#githubFileSelectDialog .githubNavigation").html($(output));
            $("#githubFileSelectDialog .githubNavigation").scrollTop(0);

            $(".githubPath[data-type='repository']").on("click", function(){
                _this.fetchRepositories(successCallback);
            });

            $(".githubPath[data-type='dir']").on("click", function(){
                _this.fetchPathContent( $(this).data("path"), successCallback);
            });

            $('.githubPath*[data-draw2d="true"][data-type="file"]').on("click", function(){
                var path = $(this).data("path");
                var sha  = $(this).data("sha");
                _this.storage.currentRepository.contents(path).read(function(param, content){
                    _this.storage.currentFileHandle={
                        path : path,
                        title: path.split(/[\\/]/).pop(), // basename
                        sha  : sha,
                        content : content
                    };
                    successCallback(content);
                    $('#githubFileSelectDialog').modal('hide');
                });
            });
        });
    },




    dirname: function(path)
    {
        if (path.length === 0)
            return "";

        var segments = path.split("/");
        if (segments.length <= 1)
            return "";
        return segments.slice(0, -1).join("/");
    }

});