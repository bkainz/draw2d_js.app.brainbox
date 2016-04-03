FileSaveAs = Class.extend({

    /**
     * @constructor
     *
     */
    init:function(storage)
    {
        this.storage=storage;

        this.sha = null;
    },

    /**
     * @method
     *
     * Open the file picker and load the selected file.
     *
     * @since 4.0.0
     */
    show: function(canvas)
    {
        var _this = this;

        if(this.storage.currentFileHandle===null){
            this.storage.currentFileHandle = {
                title:"DocumentName"+conf.fileSuffix,
                sha:null
            };
        }
        // Select first a ROOT repository if we didn'T have before
        if(_this.storage.currentRepository===null) {
            $("#githubFileSaveAsDialog .okButton").prop( "disabled", true );
            _this.fetchRepositories();
        }
        // else reopen the already selected directory
        else{
            $("#githubFileSaveAsDialog .okButton").prop( "disabled", false );
            _this.fetchPathContent(_this.storage.currentPath);
        }

        $('#githubFileSaveAsDialog').modal('show');

        $("#githubFileSaveAsDialog .githubFileName").val(_this.storage.currentFileHandle.title);

        $('#githubFileSaveAsDialog').off('shown.bs.modal').on('shown.bs.modal', function () {
            $(this).find('input:first').focus();
        });
        $("#githubFileSaveAsDialog").modal("show");

        // Button: Commit to GitHub
        //
        $("#githubFileSaveAsDialog .okButton").off('click').on("click", function () {
            var writer = new draw2d.io.json.Writer();
            writer.marshal(canvas, function (json, base64) {
                var title = $("#githubFileSaveAsDialog .githubFileName").val();
                // get the SHA if any exists....or null
                var sha  =$("*[data-title='"+title+"']").data("sha");
                var config = {
                    message: $("#githubSaveFileDialog .githubCommitMessage").val(),
                    content: base64,
                    sha: sha
                };

                var path =(_this.storage.currentPath.length===0)?title:_this.storage.currentPath+"/"+title;
                _this.storage.currentRepository.contents(path).add(config)
                    .then(function (info) {
                        _this.storage.currentFileHandle = {
                            sha  : info.content.sha,
                            path : path,
                            title: title,
                            content: json
                        };
                        $('#githubFileSaveAsDialog').modal('hide');
                    });
            });
        });
   },

    /**
     * @private
     *
     */
    fetchRepositories: function()
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
                '         <a  href="#" class="list-group-item repository text-nowrap" data-type="repository" data-id="{{id}}">'+
                '         <span title="GitHub Repository" class="fa fa-github"></span>'+
                '         {{{name}}}'+
                '         </a>'+
                '         {{/repos}}'
            );

            var output = compiled.render({
                repos: repos
            });
            $("#githubFileSaveAsDialog .githubNavigation").html($(output));
            $("#githubFileSaveAsDialog .githubNavigation").scrollTop(0);

            $(".repository").on("click", function(){
                var $this = $(this);
                var repositoryId = $this.data("id");
                _this.storage.currentRepository = $.grep(_this.storage.repositories, function(repo){return repo.id === repositoryId;})[0];
                _this.fetchPathContent("");
            });
        });
    },

    fetchPathContent: function( newPath )
    {
        var _this = this;

        this.storage.currentRepository.contents(newPath).fetch(function(param, files){
            // sort the result
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
                '           <a href="#" data-draw2d="{{draw2d}}" class="list-group-item githubPath text-nowrap" data-type="{{type}}" data-path="{{currentPath}}{{name}}" data-title="{{name}}" data-id="{{id}}" data-sha="{{sha}}">'+
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
            $("#githubFileSaveAsDialog .githubNavigation").html($(output));
            $("#githubFileSaveAsDialog .githubNavigation").scrollTop(0);

            //we are in a folder. Create of a file is possible now
            //
            $("#githubFileSaveAsDialog .okButton").prop( "disabled", false );

            $(".githubPath[data-type='repository']").on("click", function(){
                _this.fetchRepositories();
            });

            $(".githubPath[data-type='dir']").on("click", function(){
                _this.fetchPathContent( $(this).data("path"));
            });

            $('.githubPath*[data-draw2d="true"][data-type="file"]').on("click", function(){
                var path = $(this).data("path");
                var sha  = $(this).data("sha");
                var title= path.split(/[\\/]/).pop(); // basename
                $("#githubFileSaveAsDialog .githubFileName").val(title);
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