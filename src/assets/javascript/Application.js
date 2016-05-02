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

        this.currentFileHandle= {
            title: "Untitled"+conf.fileSuffix
        };
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

        $("#folder_tab a").click();
    },


    login:function()
    {
        window.location.href=conf.backend+"oauth2.php";
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
        this.currentFileHandle = {
            title: "Untitled"+conf.fileSuffix
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

        new FileSave(this.currentFileHandle).show(this.view);
    },


    fileOpen: function()
    {
        if(this.loggedIn!==true){
            this.loginFirstMessage();
            return;
        }

        $("#leftTabStrip .edit").click();
        new FileOpen(this.currentFileHandle).show(

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
        $.ajax({
            url:conf.backend +"isLoggedIn.php" ,
            xhrFields: {
                withCredentials: true
             },
            success:function(data){
                _this.loggedIn = data==="true";
                if (_this.loggedIn) {
                    $(".notLoggedIn").removeClass("notLoggedIn");
                }
            }}
        );
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
