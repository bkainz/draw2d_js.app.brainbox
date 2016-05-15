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

        $("#appLogin, #editorLogin").on("click", function(){_this.login();});
        $("#fileOpen, #editorFileOpen").on("click", function(){ _this.fileOpen(); });
        $("#fileNew").on("click", function(){_this.fileNew();});
        $("#fileSave, #editorFileSave").on("click", function(){ _this.fileSave();});
        $("#appHelp").on("click", function(){$("#leftTabStrip .gitbook").click();});
        $("#appAbout").on("click", function(){ $("#leftTabStrip .about").click();});


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

   //     $("#folder_tab a").click();
    },


    login:function()
    {
        var _this = this;
        // store the current document and visible tab pane.
        // This will be restored after the login has been done
        //
        var id= $("#leftTabStrip .active").attr("id");
        this.localStorage["pane"]=id;
        var writer = new draw2d.io.json.Writer();
        writer.marshal(this.view, function (json, base64) {
            _this.localStorage["json"]=JSON.stringify(json, undefined,2);
            window.location.href=conf.backend.oauth;
        });
    },



    dump:function()
    {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(this.view, function (json) {
            console.log(JSON.stringify(json, undefined,2));
        });
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
        $("#edit_tab a").click();
        this.currentFileHandle = {
            title: "Untitled"+conf.fileSuffix
        };
        this.view.clear();
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
                    this.view.clear();
                    var reader = new draw2d.io.json.Reader();
                    reader.unmarshal(this.view, fileData);
                    this.view.getCommandStack().markSaveLocation();
                    this.view.centerDocument();
                }
                catch(e){
                    this.view.clear();
                }
            },this));
    },


    autoLogin:function()
    {

        var _this = this;
        $.ajax({
            url:conf.backend.isLoggedIn,
            xhrFields: {
                withCredentials: true
             },
            success:function(data){
                _this.setLoginStatus(data==="true");
            },
            error:function(){
                _this.setLoginStatus(false);
            }
        });
    },

    loginFirstMessage:function()
    {
        $("#appLogin").addClass("shake");
        window.setTimeout(function(){
            $("#appLogin").removeClass("shake");
        },500);
        $.bootstrapGrowl("You must first sign in to use this functionality", {
            type: 'danger',
            align: 'center',
            width: 'auto',
            allow_dismiss: false
        });
    },

    setLoginStatus:function(isLoggedIn)
    {
        var _this = this;
        this.loggedIn = isLoggedIn;
        if (this.loggedIn) {
            $(".notLoggedIn").removeClass("notLoggedIn");
            $("#editorgroup_login").hide();
            $("#editorgroup_fileoperations").show();

        }
        else{
            $(".notLoggedIn").addClass("notLoggedIn");
            $("#editorgroup_login").show();
            $("#editorgroup_fileoperations").hide();
        }

        var id = this.localStorage["pane"];
        if(id){
            this.localStorage.removeItem("pane");
            window.setTimeout(function(){
                $("#"+id+" a").click();
                var json = this.localStorage["json"];
                _this.localStorage.removeItem("json");
                if(json){
                    console.log(json);
                    window.setTimeout(function(){
                        _this.fileNew(json);
                    },200);
                }
            },100);
        }
    }
});

;
ConnectionRouter = draw2d.layout.connection.InteractiveManhattanConnectionRouter.extend({
    NAME: "ConnectionRouter",

    /**
     * @constructor
     * Creates a new Router object.
     *
     */
    init: function () {
        this._super();

        this.setBridgeRadius(4);
        this.setVertexRadius(3);
    },

    /**
     * @method
     * Set the radius of the vertex circle.
     *
     * @param {Number} radius
     */
    setVertexRadius: function(radius)
    {
        this.vertexRadius=radius;

        return this;
    },

    /**
     * @method
     * Set the radius or span of the bridge. A bridge will be drawn if two connections are crossing and didn't have any
     * common port.
     *
     * @param {Number} radius
     */
    setBridgeRadius: function(radius)
    {
        this.bridgeRadius=radius;
        this.bridge_LR = [" r", 0.5, -0.5, radius-(radius/2), -(radius-radius/4), radius, -radius,radius+(radius/2), -(radius-radius/4), radius*2, "0 "].join(" ");
        this.bridge_RL = [" r", -0.5, -0.5, -(radius-(radius/2)), -(radius-radius/4), -radius, -radius,-(radius+(radius/2)), -(radius-radius/4), -radius*2, "0 "].join(" ");

        return this;
    },

    /**
     * @inheritdoc
     */
    _paint: function(conn)
    {
        var _this = this;
        // get the intersections to the other connections
        //
        var intersectionsASC = conn.getCanvas().getIntersection(conn).sort("x");
        var intersectionsDESC= intersectionsASC.clone().reverse();

        var intersectionForCalc = intersectionsASC;

        // add a ArrayList of all added vertex nodes to the connection
        //
        if(typeof conn.vertexNodes!=="undefined" && conn.vertexNodes!==null){
            conn.vertexNodes.remove();
        }
        conn.vertexNodes = conn.canvas.paper.set();

        // ATTENTION: we cast all x/y coordinates to integer and add 0.5 to avoid subpixel rendering of
        //            the connection. The 1px or 2px lines look much clearer than before.
        //
        var ps = conn.getVertices();
        var p = ps.get(0);
        var path = [ "M", p.x, " ", p.y];

        var oldP = p;
        var bridgeWidth =  this.bridgeRadius;
        var bridgeCode  = null;

        var calc = function(ii, interP) {
            if (draw2d.shape.basic.Line.hit(5, oldP.x, oldP.y, p.x, p.y, interP.x, interP.y) === true) {
                // It is a vertex node..
                //
                if(conn.sharingPorts(interP.other)){
                    var other = interP.other;
                    var otherZ = other.getZOrder();
                    var connZ = conn.getZOrder();
                    if(connZ<otherZ){
                        var vertexNode=conn.canvas.paper.ellipse(interP.x,interP.y, _this.vertexRadius, _this.vertexRadius).attr({fill:conn.lineColor.hash()});
                        conn.vertexNodes.push(vertexNode);
                    }
                }
                // ..or a bridge. We draw only horizontal bridges. Just a design decision
                //
                else if ((p.y|0) === (interP.y|0)) {
                    path.push(" L", (interP.x - bridgeWidth), " ", interP.y);
                    path.push(bridgeCode);
                }
            }
        };

        for (var i = 1; i < ps.getSize(); i++) {
            p = ps.get(i);

            // line goes from right->left.
            if (oldP.x > p.x) {
                intersectionForCalc=intersectionsDESC;
                bridgeCode  = this.bridge_RL;
                bridgeWidth = -this.bridgeRadius;
            }
            // line goes from left->right
            else{
                intersectionForCalc=intersectionsASC;
                bridgeCode  = this.bridge_LR;
                bridgeWidth = this.bridgeRadius;
            }

            // bridge   => the connections didn't have a common port
            // vertex => the connections did have a common source or target port
            //
            intersectionForCalc.each(calc);

            path.push(" L", p.x, " ", p.y);
            oldP = p;
        }
        conn.svgPathString = path.join("");
    }

});
;
var DropInterceptorPolicy = draw2d.policy.canvas.DropInterceptorPolicy.extend({

    NAME : "draw2d.policy.canvas.DropInterceptorPolicy",

    /**
     * @constructor
     *
     */
    init: function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
    },


    /**
     * @method
     * Called if the user want connect a port with any kind draw2d.Figure.<br>
     * Return a non <b>null</b> value if the interceptor accept the connect event.<br>
     * <br>
     * It is possible to delegate the drop event to another figure if the policy
     * returns another figure. This is usefull if a figure want to accept a port
     * drop event and delegates this drop event to another port.<br>
     *
     *
     * @param {draw2d.Figure} connectInquirer the figure who wants connect
     * @param {draw2d.Figure} connectIntent the potential connect target
     *
     * @return {draw2d.Figure} the calculated connect intent or <b>null</b> if the interceptor uses the veto right
     */
    delegateTarget: function(connectInquirer, connectIntent)
    {
        // a composite accept any kind of figures exceptional ports
        //
        if(!(connectInquirer instanceof draw2d.Port) && connectIntent instanceof draw2d.shape.composite.StrongComposite){
            return connectIntent;
        }

        // Ports accepts only Ports as DropTarget
        //
        if(!(connectIntent instanceof draw2d.Port) || !(connectInquirer instanceof draw2d.Port)){
            return null;
        }

        // consider the max possible connections for this port
        //
        if(connectIntent.getConnections().getSize() >= connectIntent.getMaxFanOut()){
            return null;
        }

        // It is not allowed to connect two output ports
        if (connectInquirer instanceof draw2d.OutputPort && connectIntent instanceof draw2d.OutputPort) {
            return null;
        }

        // It is not allowed to connect two input ports
        if (connectInquirer instanceof draw2d.InputPort && connectIntent instanceof draw2d.InputPort) {
            return null;
        }

        // It is not possible to create a loop back connection at the moment.
        // Reason: no connection router implemented for this case
        if((connectInquirer instanceof draw2d.Port) && (connectIntent instanceof draw2d.Port)){
        //    if(connectInquirer === connectIntent){
         //       return null;
           // }
        }

        // redirect the dragEnter handling to the hybrid port
        //
        if((connectInquirer instanceof draw2d.Port) && (connectIntent instanceof draw2d.shape.node.Hub)) {
            return connectIntent.getHybridPort(0);
        }

        // return the connectTarget determined by the framework or delegate it to another
        // figure.
        return connectIntent;
    }

});

;
var EditEditPolicy = draw2d.policy.canvas.BoundingboxSelectionPolicy.extend({


    init:function()
    {
      this._super();
      this.mouseMoveProxy = $.proxy(this._onMouseMoveCallback, this);
      this.configIcon=null;
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
        // we only foreward the click-event to the MarkerFigure hich the user can show hide per
        // defalt in the edit mode as well.
        if(figure instanceof MarkerFigure){
            this._super(figure, mouseX, mouseY, shiftKey, ctrlKey);
        }
    },

    onInstall:function(canvas)
    {
        this._super(canvas);
        var _this = this;

        // provide configuration menu if the mouse is close to a shape
        //
        canvas.on("mousemove", this.mouseMoveProxy);

        $("#figureConfigDialog .figureAddLabel").on("click",function(){
            _this._attachLabel(_this.configFigure);
        });
    },


    onUninstall:function(canvas)
    {
        this._super(canvas);

        canvas.off(this.mouseMoveProxy);
        $("#figureConfigDialog .figureAddLabel").off("click");
    },


    onMouseUp: function(canvas, x,y, shiftKey, ctrlKey)
    {
        if(shiftKey ===true){
            var rx = Math.min(x, this.x);
            var ry = Math.min(y, this.y);
            var rh = Math.abs(y-this.y);
            var rw = Math.abs(x-this.x);
            var raftFigure = new Raft();
            raftFigure.attr({
                x:rx,
                y:ry,
                width:rw,
                height:rh,
                color:"#1c9bab"
            });
            canvas.add(raftFigure);
            this.boundingBoxFigure1.setCanvas(null);
            this.boundingBoxFigure1 = null;
            this.boundingBoxFigure2.setCanvas(null);
            this.boundingBoxFigure2 = null;
        }
        else{
            this._super(canvas, x, y, shiftKey, ctrlKey);
        }
    },

    _onMouseMoveCallback:function(emitter, event)
    {
        // there is no benefit to show decorations during Drag&Drop of an shape
        //
        if(this.mouseMovedDuringMouseDown===true){
            if(this.configIcon!==null) {
                this.configIcon.remove();
                this.configIcon = null;
            }
            return;
        }

        var hit = null;
        var _this = this;

        emitter.getFigures().each(function(index, figure){
            if(figure.hitTest(event.x,event.y, 30)){
                hit = figure;
                return false;
            }
        });

        if(hit!==null){
            var pos = hit.getBoundingBox().getTopLeft();
            pos = emitter.fromCanvasToDocumentCoordinate(pos.x, pos.y);
            pos.y -=30;

            if(_this.configIcon===null) {
                _this.configIcon = $("<div class='ion-gear-a' id='configMenuIcon'></div>");
                $("body").append(_this.configIcon);
                $("#figureConfigDialog").hide();
                _this.configIcon.on("click",function(){
                    $("#figureConfigDialog").show().css({top: pos.y, left: pos.x, position:'absolute'});
                    _this.configFigure = hit;
                    if(_this.configIcon!==null) {
                        _this.configIcon.remove();
                        _this.configIcon = null;
                    }
                });
            }
            _this.configIcon.css({top: pos.y, left: pos.x, position:'absolute'});
        }
        else{
            if(_this.configIcon!==null) {
                var x=_this.configIcon;
                _this.configIcon = null;
                x.fadeOut(500, function(){ x.remove(); });
            }
        }
    },


    _attachLabel:function(figure)
    {
        var text = prompt("Label");
        if(text) {
            var label = new draw2d.shape.basic.Label({text:text, stroke:0, x:-20, y:-40});
            var locator = new draw2d.layout.locator.SmartDraggableLocator();
            label.installEditor(new draw2d.ui.LabelInplaceEditor());
            this.configFigure.add(label,locator);
        }
        $("#figureConfigDialog").hide();
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

        $.getJSON(conf.backend.shapesUrl+ "index.json", function(data) {

            data.forEach(function (element){
                element.basename = element.name.split("_").pop();
            });
            var tmpl = $.templates("#shapeTemplate");
            var html = tmpl.render({
                shapesUrl :conf.backend.shapesUrl,
                shapes: data
            });

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
        this.mouseDownElement=null;
    },


    onInstall:function(canvas)
    {
        canvas.getFigures().each(function(index , shape){
            shape.onStart();
        });
    },


    onUninstall:function(canvas)
    {
        canvas.getFigures().each(function(index , shape){
            shape.onStop();
        });
    },

    /**
     * @method
     *
     * @param {draw2d.Canvas} canvas
     * @param {Number} x the x-coordinate of the mouse down event
     * @param {Number} y the y-coordinate of the mouse down event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     */
    onMouseDown: function(canvas, x, y, shiftKey, ctrlKey) {
       var figure = canvas.getBestFigure(x, y);

        // may the figure is assigned to a composite. In this case the composite can
        // override the event receiver
        while (figure !== null) {
            var delegated = figure.getSelectionAdapter()();
            if (delegated === figure) {
                break;
            }
            figure = delegated;
        }

        // ignore ports since version 6.1.0. This is handled by the ConnectionCreatePolicy
        //
        if (figure instanceof draw2d.Port) {
            return;// silently
        }

        this.mouseDownElement = figure;

        if (this.mouseDownElement !== null) {
            this.mouseDownElement.fireEvent("mousedown", {x: x, y: y, shiftKey: shiftKey, ctrlKey: ctrlKey});
        }
    },

    /**
     * @method
     *
     * @param {draw2d.Canvas} canvas
     * @param {Number} x the x-coordinate of the mouse down event
     * @param {Number} y the y-coordinate of the mouse down event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     */
    onMouseUp: function(canvas, x,y, shiftKey, ctrlKey)
    {
        if(this.mouseDownElement!==null){
            this.mouseDownElement.fireEvent("mouseup", {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        }
        this.mouseDownElement = null;
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


        // configuration icon to open the config-panel of a shape
        // dynamic floating to the current shape which are close to the cursor
        //
        this.configIcon=null;
        // the figure which is related to the current open config dialog
        //
        this.configFigure=null;

        // register this class as event listener for the canvas
        // CommandStack. This is required to update the state of
        // the Undo/Redo Buttons.
        //
        this.getCommandStack().addEventListener(this);

        var router = new ConnectionRouter();
        router.abortRoutingOnFirstVertexNode=false;
        var createConnection=function(sourcePort, targetPort){
            var c = new Connection({
                color:"#000000",
                router: router,
                stroke:1.5,
                radius:2
            });
            if(sourcePort) {
                c.setSource(sourcePort);
                c.setTarget(targetPort);
            }
            return c;
        };

        this.installEditPolicy( new DropInterceptorPolicy());

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



        var setZoom = function(newZoom){
            var bb = _this.getBoundingBox().getCenter();
            var c = $("#draw2dCanvasWrapper");
            _this.setZoom(newZoom);
            c.scrollTop((bb.y/newZoom- c.height()/2));
            c.scrollLeft((bb.x/newZoom- c.width()/2));
        };
        //  ZoomIn Button and the callbacks
        //
        $("#canvas_zoom_in").on("click",function(){
            setZoom(_this.getZoom()*1.2);
        });

        // OneToOne Button
        //
        $("#canvas_zoom_normal").on("click",function(){
            setZoom(1.0);
        });

        //ZoomOut Button and the callback
        //
        $("#canvas_zoom_out").on("click",function(){
            setZoom(_this.getZoom()*0.8);
        });



        $("#editUndo").on("click", function(){
            _this.getCommandStack().undo();
        });

        $("#editRedo").on("click", function(){
            _this.getCommandStack().redo();
        });


        $("#simulationStart").on("click", function(){
            _this.simulationStart();
        });


        $("#simulationStop").on("click", function(){
            _this.simulationStop();
        });

        this.on("contextmenu", function(emitter, event){
            var figure = _this.getBestFigure(event.x, event.y);

            if(figure!==null){
                var x = event.x;
                var y = event.y;

                var pathToFile   = "https://github.com/freegroup/draw2d_js.shapes/blob/master/"+ eval(figure.NAME+".github");
                var pathToMD     = conf.shapesUrl+figure.NAME+".md";
                var pathToCustom = conf.shapesUrl+figure.NAME+".custom";
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
                                $.get(pathToCustom, function(content){
                                    new CodeDialog().show(content);
                                });
                                break;
                            case "design":
                                window.open(pathToDesign);
                                break;
                            case "help":
                                $.get(pathToMD, function(content){
                                    new MarkdownDialog().show(content);
                                });
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
                        "help":    {name: "Help"             , icon :"x ion-ios-information-outline"  },
                        "delete":  {name: "Delete"           , icon :"x ion-ios-close-outline"        },
                        "sep1":    "---------",
                        "code":    {name: "Show Code"        , icon :"x ion-social-javascript-outline"},
                        "design":  {name: "Open Designer"    , icon :"x ion-ios-compose-outline"      },
                        "bug":     {name: "Report Bug"       , icon :"x ion-social-github"            }
                    }
                });
            }
        });

        // hide the figure configuration dialog if the user clicks inside the canvas
        //
        this.on("click", function(){
            $("#figureConfigDialog").hide();
        });

    },

    /**
     * @method
     * Clear the canvas and stop the simulation. Be ready for the next clean circuit
     * load. Start from the beginning
     */
    clear: function()
    {
        this.simulationStop();

        this._super();

        this.centerDocument();
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
        var type = $(droppedDomNode).data("shape");
        var figure = eval("new "+type+"();"); // jshint ignore:line
        // create a command for the undo/redo support
        var command = new draw2d.command.CommandAdd(this, figure, x, y);
        this.getCommandStack().execute(command);
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

        setImmediate(this.animationFrameFunc);
        $("#simulationStart").addClass("disabled");
        $("#simulationStop").removeClass("disabled");
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

        $("#simulationStop").addClass("disabled");
        $("#simulationStart").removeClass("disabled");
    },

    _calculate:function()
    {
        // call the "calculate" method if given to calculate the output-port values
        //
        this.getFigures().each(function(i,figure){
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
            setImmediate(this.animationFrameFunc);
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

    },


    getBoundingBox: function()
    {
        var xCoords = [];
        var yCoords = [];
        this.getFigures().each(function(i,f){
           var b = f.getBoundingBox();
            xCoords.push(b.x, b.x+b.w);
            yCoords.push(b.y, b.y+b.h);
        });
        var minX   = Math.min.apply(Math, xCoords);
        var minY   = Math.min.apply(Math, yCoords);
        var width  = Math.max(10,Math.max.apply(Math, xCoords)-minX);
        var height = Math.max(10,Math.max.apply(Math, yCoords)-minY);

        return new draw2d.geo.Rectangle(minX,minY,width,height);
    },


    centerDocument:function()
    {
        var bb=null;
        var c = $("#draw2dCanvasWrapper");
        this.setZoom(1.0);
        if(this.getFigures().getSize()>0){
            // get the bounding box of the document and translate the complete document
            // into the center of the canvas. Scroll to the top left corner after them
            //
            bb = this.getBoundingBox();

            var dx = (this.getWidth()/2)-(bb.x+bb.w/2);
            var dy = (this.getHeight()/2)-(bb.y+bb.h/2);

            this.getFigures().each(function(i,f){
                f.translate(dx,dy);
            });
            this.getLines().each(function(i,f){
                f.translate(dx,dy);
            });
            bb = this.getBoundingBox().getCenter();

            c.scrollTop(bb.y- c.height()/2);
            c.scrollLeft(bb.x- c.width()/2);
        }
        else{
            bb={
                x:this.getWidth()/2,
                y:this.getHeight()/2
            };
            c.scrollTop(bb.y- c.height()/2);
            c.scrollLeft(bb.x- c.width()/2);

        }
    },

    calculateConnectionIntersection: function()
    {
        this._super();
        console.log("calculated");
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


var Widget = draw2d.Canvas.extend({

    init:function()
    {
        var _this = this;
        var id = "draw2dCanvas";
        this._super(id, 6000,6000);
        this.simulate = false;
        this.animationFrameFunc = $.proxy(this._calculate,this);

        // nice grid decoration for the canvas paint area
        //
        this.grid =  new draw2d.policy.canvas.ShowGridEditPolicy(20);
        this.installEditPolicy( this.grid);

        var circuit= this.getParam("circuit");
        $.getJSON(circuit,function(json){
            var reader = new draw2d.io.json.Reader();
            reader.unmarshal(widget, json);

            _this.shiftDocument();
            _this.simulationStart();
        });
    },

    simulationStart:function()
    {
        this.simulate=true;

        this.installEditPolicy(new SimulationEditPolicy());
        this.commonPorts.each(function(i,p){
            p.setVisible(false);
        });
        requestAnimationFrame(this.animationFrameFunc);
    },

    _calculate:function()
    {
        // call the "calculate" method if given to calculate the output-port values
        //
        this.getFigures().each(function(i,figure){
            figure.calculate();
        });

        // transport the value from outputPort to inputPort
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

    getBoundingBox: function(){
        var xCoords = [];
        var yCoords = [];
        this.getFigures().each(function(i,f){
            var b = f.getBoundingBox();
            xCoords.push(b.x, b.x+b.w);
            yCoords.push(b.y, b.y+b.h);
        });
        var minX   = Math.min.apply(Math, xCoords);
        var minY   = Math.min.apply(Math, yCoords);
        var width  = Math.max(10,Math.max.apply(Math, xCoords)-minX);
        var height = Math.max(10,Math.max.apply(Math, yCoords)-minY);

        return new draw2d.geo.Rectangle(minX,minY,width,height);
    },

    shiftDocument:function()
    {
        // get the bounding box of the document and translate the complete document
        // into the center of the canvas. Scroll to the top left corner after them
        //
        var bb = this.getBoundingBox();

        var dx = -bb.x;
        var dy = -bb.y;

        this.getFigures().each(function(i,f){
            f.translate(dx,dy);
        });
        this.getLines().each(function(i,f){
            f.translate(dx,dy);
        });
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
    init:function(fileHandle)
    {
        this.currentFileHandle=fileHandle;
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

        this.fetchPathContent( successCallback);
    },

    fetchPathContent: function( successCallback )
    {
        var _this = this;

        $.ajax({
                url:conf.backend.file.list ,
                xhrFields: {
                    withCredentials: true
                },
                success:function(response) {
                    var files = response.files;
                    // sort the reusult
                    // Directories are always on top
                    //
                    files.sort(function (a, b) {
                        if (a.type === b.type) {
                            if (a.name.toLowerCase() < b.name.toLowerCase())
                                return -1;
                            if (a.name.toLowerCase() > b.name.toLowerCase())
                                return 1;
                            return 0;
                        }
                        if (a.type === "dir") {
                            return -1;
                        }
                        return 1;
                    });

                    var compiled = Hogan.compile(
                        '         {{#files}}' +
                        '           <a href="#" data-draw2d="{{draw2d}}" class="list-group-item githubPath text-nowrap" data-name="{{name}}" data-id="{{id}}">' +
                        '              <span class="fa fa-file-o"></span>' +
                        '              {{{name}}}' +
                        '           </a>' +
                        '         {{/files}}'
                    );
                    var output = compiled.render({
                        files: files,
                        draw2d: function () {
                            return this.id.endsWith(conf.fileSuffix);
                        }
                    });

                    $("#githubFileSelectDialog .githubNavigation").html($(output));
                    $("#githubFileSelectDialog .githubNavigation").scrollTop(0);


                    $('.githubPath[data-draw2d="true"]').on("click", function () {
                        var id   = $(this).data("id");
                        var name = $(this).data("name");
                        $.ajax({
                                url: conf.backend.file.get,
                                method: "POST",
                                xhrFields: {
                                    withCredentials: true
                                },
                                data:{
                                    id:id
                                }
                            }
                        ).done(function(content){
                                _this.currentFileHandle.title=name;
                                successCallback(content);
                                $('#githubFileSelectDialog').modal('hide');
                                console.log(_this.currentFileHandle);
                            }
                        );

                    });
                }
        });
    }
});
;
FileSave = Class.extend({

    /**
     * @constructor
     *
     */
    init:function(fileHandler){
        this.currentFileHandle = fileHandler;
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

        $("#githubSaveFileDialog .githubFileName").val(_this.currentFileHandle.title);

        $('#githubSaveFileDialog').on('shown.bs.modal', function () {
            $(this).find('input:first').focus();
        });
        $("#githubSaveFileDialog").modal("show");

        // Button: Commit to GitHub
        //
        $("#githubSaveFileDialog .okButton").on("click", function () {
            var writer = new draw2d.io.json.Writer();
            writer.marshal(canvas, function (json, base64) {
                $.ajax({
                        url: conf.backend.file.save,
                        method: "POST",
                        xhrFields: {
                            withCredentials: true
                        },
                        data:{
                            id:$("#githubSaveFileDialog .githubFileName").val(),
                            content:JSON.stringify(json, undefined, 2)
                        }
                    }
                ).done(function(){
                        $('#githubSaveFileDialog').modal('hide');
                });

            });
        });

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
;

var Connection = draw2d.Connection.extend({

    init : function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
    },

    setCanvas: function(canvas)
    {
        this._super(canvas);

        // remove any decoration if exists
        if(canvas===null){

        }
    },

    disconnect: function()
    {
       this._super();

       // remove some decorations of the router.
       // This is a design flaw. the router creates the decoration and the connection must remove them :-/
       // Unfortunately the Router didn't have a callback when a connection is removed from the canvas.
       //
        if(typeof this.vertexNodes!=="undefined" && this.vertexNodes!==null){
            this.vertexNodes.remove();
            delete this.vertexNodes;
        }
    }
});

;

var DecoratedInputPort = draw2d.InputPort.extend({

    init : function(attr, setter, getter)
    {
        this.hasChanged = false;

        this._super(attr, setter, getter);
        
        this.decoration = new MarkerFigure();

        this.add(this.decoration, new draw2d.layout.locator.LeftLocator({margin:8}));

        this.on("disconnect",function(emitter, event){
            this.decoration.setVisible(this.getConnections().getSize()===0);

            // default value of a not connected port is always HIGH
            //
            if(this.getConnections().getSize()===0){
                this.setValue(true);
            }
        }.bind(this));

        this.on("connect",function(emitter, event){
            this.decoration.setVisible(false);
        }.bind(this));

        this.on("dragend",function(emitter, event){
            this.decoration.setVisible(this.getConnections().getSize()===0);
        }.bind(this));
        
        this.on("drag",function(emitter, event){
            this.decoration.setVisible(false);
        }.bind(this));

        // a port can have a value. Usefull for workflow engines or circuit diagrams
        this.setValue(true);
    },

    useDefaultValue:function()
    {
        this.decoration.setStick(true);
    },

    setValue:function(value)
    {
        this.hasChanged = this.value !==value;
        this._super(value);
    },

    hasChangedValue: function()
    {
        return this.hasChanged;
    },

    hasRisingEdge: function()
    {
        return this.hasChangedValue()&& this.getValue();
    },

    hasFallingEdge: function()
    {
        return this.hasChangedValue() && !this.getValue();
    }
});

;
/**
 * The markerFigure is the left hand side annotation for a DecoratedPort.
 *
 * It contains two children
 *
 * StateAFigure: if the mouse hover and the figure isn't permanent visible
 * StateBFigure: either the mouse is over or the user pressed the checkbox to stick the figure on the port
 *
 * This kind of decoration is usefull for defualt values on workflwos enginges or circuit diagrams
 *
 */
var MarkerFigure = draw2d.shape.layout.VerticalLayout.extend({

    NAME : "MarkerFigure",

    init : function(attr, setter, getter)
    {
        var _this = this;

        this.isMouseOver = false;        // indicator if the mouse is over the element
        this.stick       = false;        // indicator if the stateBFigure should always be visible
        this.defaultValue= true;         // current selected default value for the decoration

        this._super($.extend({
              stroke:0
        },attr),
        setter, 
        getter);


        // figure if the decoration is not permanent visible (sticky note)
        this.add(this.stateA = new MarkerStateAFigure({text:"X"}));
        // figure if the decoration permanent visible
        this.add(this.stateB = new MarkerStateBFigure({text:"X"}));


        this.on("mouseenter",function(emitter, event){
            _this.onMouseOver(true);
        });

        this.on("mouseleave",function(emitter, event){
            _this.onMouseOver(false);
        });

        this.on("click",function(emitter, event){
            if (_this.isVisible() === false) {
                return;//silently
            }

            if(_this.stateB.getStickTickFigure().getBoundingBox().hitTest(event.x, event.y) === true){
                _this.setStick(!_this.getStick());
            }
            else if(_this.stateB.getLabelFigure().getBoundingBox().hitTest(event.x, event.y) === true){
                $.contextMenu({
                    selector: 'body',
                    trigger:"left",
                    events:
                    {
                        hide:function(){ $.contextMenu( 'destroy' ); }
                    },
                    callback: $.proxy(function(key, options)
                    {
                        // propagate the default value to the port
                        //
                        switch(key){
                            case "high":
                                _this.setDefaultValue(true);
                                break;
                            case "low":
                                _this.setDefaultValue(false);
                                break;
                            default:
                                break;
                        }

                    },this),
                    x:event.x,
                    y:event.y,
                    items:{
                        "high": {name: "High"},
                        "low":  {name: "Low" }
                    }
                });

            }
        });

        this.setDefaultValue(true);
        this.onMouseOver(false);
    },

    onMouseOver: function(flag)
    {
        this.isMouseOver = flag;

        if(this.visible===false){
            return; // silently
        }

        if(this.stick===true) {
            this.stateA.setVisible(false);
            this.stateB.setVisible(true);
        }
        else{
            this.stateA.setVisible(!this.isMouseOver);
            this.stateB.setVisible( this.isMouseOver);
        }

        return this;
    },


    setVisible: function(flag)
    {
        this._super(flag);

        // update the hover/stick state of the figure
        this.onMouseOver(this.isMouseOver);

        return this;
    },


    setStick:function(flag)
    {
        this.stick = flag;
        this.onMouseOver(this.isMouseOver);


        // the port has only a default value if the decoration is visible
        this.parent.setValue(flag?this.defaultValue:null);

        this.stateB.setTick(this.getStick());

        return this;
    },


    getStick:function()
    {
        return this.stick;
    },


    setText: function(text)
    {
        this.stateB.setText(text);

        return this;
    },

    setDefaultValue: function(value)
    {
        this.defaultValue = value;
        this.setText((this.defaultValue===true)?"High":"Low ");

        // only propagate the value to the parent if the decoration permanent visible
        //
        if(this.stick===true){
            this.parent.setValue(this.defaultValue);
        }
    }
});

;
/**
 * This is only the mouseover reactive shape. A little bit smaller than the visible shape
 *
 * Or you can display this shape with opacity of 0.2 to indicate that this is a reactive area.
 */
var MarkerStateAFigure = draw2d.shape.basic.Label.extend({

    NAME : "MarkerStateAFigure",

    /**
     * @param attr
     */
    init : function(attr, setter, getter)
    {
        this._super($.extend({
            padding:{left:5, top:2, bottom:2, right:10},
            bgColor:null,
            stroke:1,
            color:null,
            fontColor:null,
            fontSize:8
        },attr), 
        setter, 
        getter);

        // we must override the hitTest method to ensure that the parent can receive the mouseenter/mouseleave events.
        // Unfortunately draw2D didn't provide event bubbling like HTML. The first shape in queue consumes the event.
        //
        // now this shape is "dead" for any mouse events and the parent must/can handle this.
        this.hitTest = function(){return false;};
    }

});
;
var MarkerStateBFigure = draw2d.shape.layout.HorizontalLayout.extend({

    NAME : "MarkerStateBFigure",

    /**
     * @param attr
     */
    init : function(attr, setter, getter)
    {
        this._super($.extend({
            bgColor:"#FFFFFF",
            stroke:1,
            color:"#00bcd4",
            radius:2,
            padding:{left:3, top:2, bottom:0, right:8},
            gap:5
        },attr), 
        setter, 
        getter);

        this.stickTick = new draw2d.shape.basic.Circle({
            diameter:8,
            bgColor:"#f0f0f0",
            stroke:1,
            resizeable:false
        });
        this.add(this.stickTick);
        this.stickTick.hitTest = function(){return false;};
        this.stickTick.addCssClass("highlightOnHover");

        this.label = new draw2d.shape.basic.Label({
            text:attr.text,
            resizeable:false,
            stroke:0,
            padding:0,
            fontSize:8,
            fontColor:"#303030"
        });
        this.add(this.label);
        // don't catch the mouse events. This is done by the parent container
        this.label.hitTest = function(){return false;};
        this.label.addCssClass("highlightOnHover");

        // we must override the hitTest method to ensure that the parent can receive the mouseenter/mouseleave events.
        // Unfortunately draw2D didn't provide event bubbling like HTML. The first shape in queue consumes the event.
        //
        // now this shape is "dead" for any mouse events and the parent must/can handle this.
        this.hitTest = function(){return false;};
    },

    setText: function(text)
    {
        this.label.setText(text);
    },

    setTick :function(flag)
    {
        this.stickTick.attr({bgColor:flag?"#00bcd4":"#f0f0f0"});
   },

    getStickTickFigure:function()
    {
        return this.stickTick;
    },

    getLabelFigure:function()
    {
        return this.label;
    },

    /**
     * @method
     *
     *
     * @template
     **/
    repaint: function(attributes)
    {
        if(this.repaintBlocked===true || this.shape===null){
            return;
        }

        attributes= attributes || {};

        attributes.path = this.calculatePath();

        this._super(attributes);
    },


    /**
     * @method
     *
     * Override the default rendering of the HorizontalLayout, which is a simple
     * rectangle. We want an arrow.
     */
    createShapeElement : function()
    {
        return this.canvas.paper.path(this.calculatePath());
    },

    /**
     * stupid copy&paste the code from the Polygon shape...unfortunately the LayoutFigure isn't a polygon.
     *
     * @returns {string}
     */
    calculatePath: function()
    {
        var arrowLength=8;

        this.vertices   = new draw2d.util.ArrayList();

        var w  = this.width;
        var h  = this.height;
        var pos= this.getAbsolutePosition();
        var i  = 0;
        var length=0;
        this.vertices.add(new draw2d.geo.Point(pos.x,  pos.y)  );
        this.vertices.add(new draw2d.geo.Point(pos.x+w-arrowLength,pos.y)  );

        this.vertices.add(new draw2d.geo.Point(pos.x+w,pos.y+h/2));

        this.vertices.add(new draw2d.geo.Point(pos.x+w-arrowLength,pos.y+h));
        this.vertices.add(new draw2d.geo.Point(pos.x  ,pos.y+h));

        var radius = this.getRadius();
        var path = [];
        // hard corners
        //
        if(radius === 0){
            length = this.vertices.getSize();
            var p = this.vertices.get(0);
            path.push("M",p.x," ",p.y);
            for(i=1;i<length;i++){
                p = this.vertices.get(i);
                path.push("L", p.x, " ", p.y);
            }
            path.push("Z");
        }
        // soften/round corners
        //
        else{
            length = this.vertices.getSize();
            var start = this.vertices.first();
            var end   = this.vertices.last();
            if(start.equals(end)){
                length = length-1;
                end = this.vertices.get(length-1);
            }
            var begin   = draw2d.geo.Util.insetPoint(start,end, radius);
            path.push("M", begin.x, ",", begin.y);
            for( i=0 ;i<length;i++){
                start = this.vertices.get(i);
                end   = this.vertices.get((i+1)%length);
                modStart = draw2d.geo.Util.insetPoint(start,end, radius);
                modEnd   = draw2d.geo.Util.insetPoint(end,start,radius);
                path.push("Q",start.x,",",start.y," ", modStart.x, ", ", modStart.y);
                path.push("L", modEnd.x, ",", modEnd.y);
            }
        }
        return path.join("");
    }


});

;
/**
 * The markerFigure is the left hand side annotation for a DecoratedPort.
 *
 * It contains two children
 *
 * StateAFigure: if the mouse hover and the figure isn't permanent visible
 * StateBFigure: either the mouse is over or the user pressed the checkbox to stick the figure on the port
 *
 * This kind of decoration is usefull for defualt values on workflwos enginges or circuit diagrams
 *
 */
var Raft = draw2d.shape.composite.Raft.extend({

    NAME : "Raft",

    init : function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
    },

    calculate: function()
    {

    },

    onStart:function()
    {

    },

    onStop:function()
    {

    },

    toBack:function(figure)
    {
        if(this.canvas.getFigures().getSize()===1){
            return ; // silently
        }

        // unfortunately the shape goes behind the "canvas decoration" which could be the grid or dots.
        // this is sad and unwanted. In this case we select the first figure in th canvas and set the Raft behind of them
        // instead of "behind of ALL shapes"
        var first = this.canvas.getFigures().first();
        this._super(first);
    }

});

;
var raspi={

    gpio:function(pin, value)
    {
        socket.emit('gpi:set', {
            pin:pin,
            value:value
        });
    }
};