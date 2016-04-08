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


        var code = this.getParam("code");
        if (code!==null) {
            $.getJSON(conf.githubAuthenticateCallback+code, function(data) {
                _this.storage.connect(data.token, $.proxy(function(success){
                    _this.loggedIn = success;
                },this));
            });
        }
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
        if( results === null )
            return null;

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

        new FileOpen(this.storage).show(

            // success callback
            $.proxy(function(fileData){
                try{
                    _this.fileNew();
                    $("#leftTabStrip .edit").click();

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


    loginFirstMessage:function(){
        $.bootstrapGrowl("You must first login into GITHUB to open a file from there!", {
            type: 'danger',
            align: 'center',
            width: 'auto',
            allow_dismiss: false
        });
    }



});
