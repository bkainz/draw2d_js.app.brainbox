/*jshint sub:true*/


/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 */

var Application = Class.extend(
{

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function()
    {
        var _this = this;

        this.localStorage = [];
        try {
            if( 'localStorage' in window && window.localStorage !== null){
                this.localStorage = localStorage;
            }
        } catch(e) {

        }

        this.storage = new BackendStorage();
        this.palette = new Palette(this);
        this.view    = new View(this, "draw2dCanvas");
        this.loggedIn = false;

        $("#appLogin").on("click", function(){
            _this.login();
        });

        $("#fileOpen").on("click", function(){
            _this.fileOpen();
        });


        $("#fileNew").on("click", function(){
            _this.fileNew();
        });

        $("#fileSave").on("click", function(){
            _this.fileSave();
        });

        $("#appHelp").on("click", function(){
            $("#leftTabStrip .gitbook").click();
        });


        // First check if a valid token is inside the local storage
        //
        this.autoLogin();

        /*
         * Replace all SVG images with inline SVG
         */
        $('img.svg').each(function(){
            var $img = $(this);
            var imgURL = $img.attr('src');

            jQuery.get(imgURL, function(data) {
                // Get the SVG tag, ignore the rest
                var $svg = $(data).find('svg');
                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');
                // Replace image with new SVG
                $img.replaceWith($svg);
            }, 'xml');

        });
    },


    login:function()
    {
        window.location.href='https://github.com/login/oauth/authorize?client_id='+conf.githubClientId+'&scope=public_repo';
    },

    getParam: function( name )
    {
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( window.location.href );

        // the param isn'T part of the normal URL pattern...
        //
        if( results === null ) {
            // maybe it is part in the hash.
            //
            regexS = "[\\#]"+name+"=([^&#]*)";
            regex = new RegExp( regexS );
            results = regex.exec( window.location.hash );
            if( results === null ) {
                return null;
            }
        }

        return results[1];
    },

    fileNew: function(shapeTemplate)
    {
        this.view.clear();
        this.localStorage.removeItem("json");
        this.storage.currentFileHandle = null;
        this.documentConfiguration = {
            baseClass:"draw2d.SetFigure"
        };
        if(shapeTemplate){
            var reader = new draw2d.io.json.Reader();
            reader.unmarshal(this.view, shapeTemplate);
        }
    },


    fileSave: function()
    {
        if(this.loggedIn!==true){
            this.loginFirstMessage();
            return;
        }


        if(this.storage.currentFileHandle===null) {
            new FileSaveAs(this.storage).show(this.view);
        }
        else{
            new FileSave(this.storage).show(this.view);
        }
    },


    fileOpen: function()
    {
        if(this.loggedIn!==true){
            this.loginFirstMessage();
            return;
        }

        $("#leftTabStrip .edit").click();
        new FileOpen(this.storage).show(

            // success callback
            $.proxy(function(fileData){
                try{
                    this.fileNew();

                    this.view.clear();
                    var reader = new draw2d.io.json.Reader();
                    reader.unmarshal(this.view, fileData);
                    this.view.getCommandStack().markSaveLocation();
                }
                catch(e){
                    this.view.reset();
                }
            },this));
    },


    autoLogin:function()
    {
        var _this = this;
        var _doIt=function() {
            var code = _this.getParam("code");
            if (code !== null) {
                $.getJSON(conf.githubAuthenticateCallback + code, function (data) {
                    _this.storage.connect(data.token, function (success) {
                        if (success) {
                            _this.localStorage["token"] = data.token;
                            _this.loggedIn = success;
                            $(".notLoggedIn").removeClass("notLoggedIn");
                        }
                        else {
                            _this.localStorage.removeItem("token");
                        }

                    });
                });
            }
        };

        var token = this.localStorage["token"];
        if(token){
            _this.storage.connect(token, function(success){
                _this.loggedIn = success;
                if(!success){
                    _doIt();
                }
                else{
                    $(".notLoggedIn").removeClass("notLoggedIn");
                }
            });
        }
        // or check if we come back from the OAuth redirect
        //
        else{
            _doIt();
        }
    },

    loginFirstMessage:function(){
        $.bootstrapGrowl("You must first login into GITHUB to use this functionality", {
            type: 'danger',
            align: 'center',
            width: 'auto',
            allow_dismiss: false
        });
    }



});

;
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
;
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

;
var EditEditPolicy = draw2d.policy.canvas.BoundingboxSelectionPolicy.extend({


    init:function()
    {
      this._super();
    },

    /**
     * @method
     * Called by the canvas if the user click on a figure.
     *
     * @param {draw2d.Figure} the figure under the click event. Can be null
     * @param {Number} mouseX the x coordinate of the mouse during the click event
     * @param {Number} mouseY the y coordinate of the mouse during the click event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     *
     * @since 3.0.0
     */
    onClick: function(figure, mouseX, mouseY, shiftKey, ctrlKey)
    {
        // do nothing in edit
    }
});
;
/*jshint sub:true*/


/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 */

var Palette = Class.extend(
{

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function(app)
    {
        var _this = this;

        var $grid = $("#paletteElements");

        $.getJSON("http://freegroup.github.io/draw2d_js.shapes/assets/shapes/index.json", function(data) {

            data.forEach(function (element){
                element.basename = element.name.split("_").pop();
            });
            var tmpl = $.templates("#shapeTemplate");
            var html = tmpl.render({shapes: data});

            $("#paletteElements").html(html);

            // Advanced filtering
            $('#filter').on('keyup change', function (event) {
                if(event.keyCode===27){
                    $('#filter').val("");
                }
                var val = this.value.toLowerCase();
                $grid.shuffle('shuffle', function ($el, shuffle) {
                    var text = $.trim($el.data("name")).toLowerCase();
                    return text.indexOf(val) !== -1;
                });
            });


            // Create the jQuery-Draggable for the palette -> canvas drag&drop interaction
            //
            $(".draw2d_droppable").draggable({
                appendTo:"body",
                stack:"body",
                zIndex: 27000,
                helper:"clone",
                drag: function(event, ui){
                    event = app.view._getEvent(event);
                    var pos = app.view.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    app.view.onDrag(ui.draggable, pos.getX(), pos.getY(), event.shiftKey, event.ctrlKey);
                },
                stop: function(e, ui){
                },
                start: function(e, ui){
                    $(ui.helper).addClass("shadow");
                }
            });

            $('.draw2d_droppable').on('mouseover', function(){
                $(this).parent().addClass('glowBorder');
            }).on('mouseout', function(){
                $(this).parent().removeClass('glowBorder');
            });


        });

    }
});

;
var SimulationEditPolicy = draw2d.policy.canvas.ReadOnlySelectionPolicy.extend({


    init:function()
    {
      this._super();
    },

    /**
     * @method
     * Called by the canvas if the user click on a figure.
     *
     * @param {draw2d.Figure} the figure under the click event. Can be null
     * @param {Number} mouseX the x coordinate of the mouse during the click event
     * @param {Number} mouseY the y coordinate of the mouse during the click event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     *
     * @since 3.0.0
     */
    onClick: function(figure, mouseX, mouseY, shiftKey, ctrlKey)
    {
        if(figure!==null){
            figure.fireEvent("click", {
                figure:figure,
                x:mouseX,
                y:mouseY,
                relX: mouseX-figure.getAbsoluteX(),
                relY: mouseY-figure.getAbsoluteY(),
                shiftKey:shiftKey,
                ctrlKey:ctrlKey});

            figure.onClick();
        }
    }
});
;
/*jshint sub:true*/
/*jshint evil:true */


/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 */


var View = draw2d.Canvas.extend({

    init:function(app, id)
    {
        var _this = this;

        this._super(id, 6000,6000);
        this.simulate = false;
        this.animationFrameFunc = $.proxy(this._calculate,this);


        // register this class as event listener for the canvas
        // CommandStack. This is required to update the state of
        // the Undo/Redo Buttons.
        //
        this.getCommandStack().addEventListener(this);

        var router = new draw2d.layout.connection.InteractiveManhattanConnectionRouter();
        router.abortRoutingOnFirstVertexNode=false;
        var createConnection=function(sourcePort, targetPort){
            var c = new draw2d.Connection({
                color:"#000000",
                router: router,
                stroke:2,
                radius:2
            });
            if(sourcePort) {
                c.setSource(sourcePort);
                c.setTarget(targetPort);
            }
            return c;
        };


        // install a Connection create policy which matches to a "circuit like"
        // connections
        //
        this.connectionPolicy = new draw2d.policy.connection.ComposedConnectionCreatePolicy(
                [
                    // create a connection via Drag&Drop of ports
                    //
                    new draw2d.policy.connection.DragConnectionCreatePolicy({
                        createConnection:createConnection
                    }),
                    // or via click and point
                    //
                    new draw2d.policy.connection.OrthogonalConnectionCreatePolicy({
                        createConnection:createConnection
                    })
                ]);
        this.installEditPolicy(this.connectionPolicy);

        // show the ports of the elements only if the mouse cursor is close to the shape.
        //
        this.coronaFeedback = new draw2d.policy.canvas.CoronaDecorationPolicy();
        this.installEditPolicy(this.coronaFeedback);

        // nice grid decoration for the canvas paint area
        //
        this.grid =  new draw2d.policy.canvas.ShowGridEditPolicy(20);
        this.installEditPolicy( this.grid);

        // add some SnapTo policy for better shape/figure alignment
        //
        this.installEditPolicy( new draw2d.policy.canvas.SnapToGeometryEditPolicy());
        this.installEditPolicy( new draw2d.policy.canvas.SnapToCenterEditPolicy());
        this.installEditPolicy( new draw2d.policy.canvas.SnapToInBetweenEditPolicy());


        this.installEditPolicy(new EditEditPolicy());

        // Enable Copy&Past for figures
        //
        Mousetrap.bind(['ctrl+c', 'command+c'], $.proxy(function (event) {
            var primarySelection = this.getSelection().getPrimary();
            if(primarySelection!==null){
                this.clippboardFigure = primarySelection.clone({excludePorts:true});
                this.clippboardFigure.translate(5,5);
            }
            return false;
        },this));
        Mousetrap.bind(['ctrl+v', 'command+v'], $.proxy(function (event) {
            if(this.clippboardFigure!==null){
                var cloneToAdd = this.clippboardFigure.clone({excludePorts:true});
                var command = new draw2d.command.CommandAdd(this, cloneToAdd, cloneToAdd.getPosition());
                this.getCommandStack().execute(command);
                this.setCurrentSelection(cloneToAdd);
            }
            return false;
        },this));


        // add keyboard support for shape/figure movement
        //
        Mousetrap.bind(['left'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            var primarySelection = _this.getSelection().getPrimary();
            if(primarySelection!==null){ primarySelection.translate(-diff,0);}
            return false;
        });
        Mousetrap.bind(['up'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            var primarySelection = _this.getSelection().getPrimary();
            if(primarySelection!==null){ primarySelection.translate(0,-diff);}
            return false;
        });
        Mousetrap.bind(['right'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            var primarySelection = _this.getSelection().getPrimary();
            if(primarySelection!==null){ primarySelection.translate(diff,0);}
            return false;
        });
        Mousetrap.bind(['down'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            var primarySelection = _this.getSelection().getPrimary();
            if(primarySelection!==null){ primarySelection.translate(0,diff);}
            return false;
        });



        $("#editUndo").on("click", function(){
            _this.getCommandStack().undo();
        });

        $("#editRedo").on("click", function(){
            _this.getCommandStack().redo();
        });


        $("#simulationStart").on("click", function(){
            _this.simulationStart();
            $("#simulationStart").addClass("disabled");
            $("#simulationStop").removeClass("disabled");
        });


        $("#simulationStop").on("click", function(){
            _this.simulationStop();
            $("#simulationStop").addClass("disabled");
            $("#simulationStart").removeClass("disabled");
        });

    },

    /**
     * @method
     * Called if the user drop the droppedDomNode onto the canvas.<br>
     * <br>
     * Draw2D use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     *
     * @param {HTMLElement} droppedDomNode The dropped DOM element.
     * @param {Number} x the x coordinate of the drop
     * @param {Number} y the y coordinate of the drop
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * @private
     **/
    onDrop : function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
        var _this = this;
        var type = $(droppedDomNode).data("shape");
        var figure = eval("new "+type+"();"); // jshint ignore:line
        // create a command for the undo/redo support
        var command = new draw2d.command.CommandAdd(this, figure, x, y);
        this.getCommandStack().execute(command);

        figure.on("contextmenu", function(){
            var pathToFile   = "https://github.com/freegroup/draw2d_js.shapes/blob/master/"+ eval(figure.NAME+".github");
            var pathToDesign = "http://freegroup.github.io/draw2d_js.app.shape_designer/#file="+ figure.NAME+".shape";
            $.contextMenu({
                selector: 'body',
                events:
                {
                    hide:function(){ $.contextMenu( 'destroy' ); }
                },
                callback: $.proxy(function(key, options)
                {
                    switch(key){
                        case "code":
                            new CodeDialog().show( eval(figure.NAME+".logic"));
                            break;
                        case "design":
                            window.open(pathToDesign);
                            break;
                        case "help":
                            new MarkdownDialog().show( eval(figure.NAME+".markdown"));
                            break;
                        case "bug":
                            var pathToIssues = "https://github.com/freegroup/draw2d_js.shapes/issues/new";
                            var createUrl = pathToIssues+"?title=Error in shape '"+figure.NAME+"'&body="+encodeURIComponent("I found a bug in "+figure.NAME+".\n\nError Description here...\n\n\nLinks to the code;\n[GitHub link]("+pathToFile+")\n[Designer Link]("+pathToDesign+")\n");
                            window.open(createUrl);
                            break;
                        case "delete":
                            var cmd = new draw2d.command.CommandDelete(figure);
                            _this.getCommandStack().execute(cmd);
                            break;
                        default:
                            break;
                    }

                },this),
                x:x,
                y:y,
                items:
                {
                    "code":    {name: "Show Code"},
                    "design":  {name: "Open in Designer"},
                    "help":    {name: "Help"},
                    "bug":     {name: "Report a Bug"},
                    "sep1":  "---------",
                    "delete":{name: "Delete"}
                }
            });

        });
    },


    simulationStart:function()
    {
        this.simulate=true;

        this.installEditPolicy(new SimulationEditPolicy());
        this.uninstallEditPolicy(this.connectionPolicy);
        this.uninstallEditPolicy(this.coronaFeedback);
        this.commonPorts.each(function(i,p){
            p.setVisible(false);
        });
        requestAnimationFrame(this.animationFrameFunc);
    },

    simulationStop:function()
    {
        this.simulate = false;
        this.commonPorts.each(function(i,p){
            p.setVisible(true);
        });
        this.installEditPolicy(new EditEditPolicy());
        this.installEditPolicy(this.connectionPolicy);
        this.installEditPolicy(this.coronaFeedback);

    },

    _calculate:function()
    {
        // call the "calculate" method if given to calculate the output-port values
        //
        var figures = this.getFigures().clone().grep(function(f){
            return f['calculate'];
        });
        figures.each(function(i,figure){
            figure.calculate();
        });

        // transport the value from oututPort to inputPort
        //
        this.getLines().each(function(i,line){
            var outPort = line.getSource();
            var inPort  = line.getTarget();
            inPort.setValue(outPort.getValue());
            line.setColor(outPort.getValue()?"#C21B7A":"#0078F2");
        });

        if(this.simulate===true){
            requestAnimationFrame(this.animationFrameFunc);
        }
    },

    /**
     * @method
     * Sent when an event occurs on the command stack. draw2d.command.CommandStackEvent.getDetail()
     * can be used to identify the type of event which has occurred.
     *
     * @template
     *
     * @param {draw2d.command.CommandStackEvent} event
     **/
    stackChanged:function(event)
    {
        $("#editUndo").addClass("disabled");
        $("#editRedo").addClass("disabled");

        if(event.getStack().canUndo()) {
            $("#editUndo").removeClass("disabled");
        }

        if(event.getStack().canRedo()) {
            $("#editRedo").removeClass("disabled");
        }

    }
});

;
About = Class.extend(
{
    NAME : "shape_designer.dialog.About", 

    init:function(){
     },

	show:function(){
		
	    this.splash = $(
	            '<div id="splash">'+
	            '<div>Draw2D Designer<br>'+
	            '@VERSION@'+
	            '</div>'+
	            '</div>');
	    this.splash.hide();
	    $("body").append(this.splash);
	    
	    this.splash.fadeIn("fast");
	    
	},
	
	hide: function(){
        this.splash.delay(2500)
        .fadeOut( "slow", $.proxy(function() {
            this.splash.remove();
        },this));
	}

      
});  
;
var CodeDialog = Class.extend(
    {

        init:function(){
        },

        show:function(js){
            $('#codePreviewDialog .prettyprint').text(js);
            $('#codePreviewDialog .prettyprint').removeClass("prettyprinted");
            prettyPrint();
            $('#codePreviewDialog').modal('show');
        }
});
;
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
;
FileSave = Class.extend({

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
    show: function(canvas)
    {
        var _this = this;

        if(this.storage.currentFileHandle===null){
            this.storage.currentFileHandle= {
                title:"DocumentName",
                sha:null
            };
        }
        $("#githubSaveFileDialog .githubFileName").val(_this.storage.currentFileHandle.title);

        $('#githubSaveFileDialog').on('shown.bs.modal', function () {
            $(this).find('input:first').focus();
        });
        $("#githubSaveFileDialog").modal("show");

        // Button: Commit to GitHub
        //
        $("#githubSaveFileDialog .okButton").on("click", function () {
            var writer = new draw2d.io.json.Writer();
            writer.marshal(canvas, function (json, base64) {
                var config = {
                    message: $("#githubSaveFileDialog .githubCommitMessage").val(),
                    content: base64,
                    sha: _this.storage.currentFileHandle.sha
                };

                _this.storage.currentRepository.contents(_this.storage.currentFileHandle.path).add(config)
                    .then(function (info) {
                        _this.storage.currentFileHandle.sha = info.content.sha;
                        $('#githubSaveFileDialog').modal('hide');
                    });
            });
        });

    }

});
;
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
;
var MarkdownDialog = Class.extend(
    {

        init:function(){
            this.defaults = {
                html:         false,        // Enable HTML tags in source
                xhtmlOut:     false,        // Use '/' to close single tags (<br />)
                breaks:       false,        // Convert '\n' in paragraphs into <br>
                langPrefix:   'language-',  // CSS language prefix for fenced blocks
                linkify:      true,         // autoconvert URL-like texts to links
                linkTarget:   '',           // set target to open link in
                typographer:  true          // Enable smartypants and other sweet transforms
            };
        },

        show:function(markdown){
            var markdownParser = new Remarkable('full', this.defaults);
            $('#markdownDialog .html').html(markdownParser.render(markdown));
            $('#markdownDialog').modal('show');
        }
});