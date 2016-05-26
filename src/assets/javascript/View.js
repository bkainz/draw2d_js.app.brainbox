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

        this.probeWindow = new ProbeWindow();

        this.simulate = false;
        this.animationFrameFunc = $.proxy(this._calculate,this);


        // configuration icon to open the config-panel of a shape
        // dynamic floating to the current shape which are close to the cursor
        //
        this.configIcon=null;
        // the figure which is related to the current open config dialog
        //
        this.configFigure=null;

        this.timerBase = 10; // ms calculate every 10ms all elements

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
        this.coronaFeedback = new draw2d.policy.canvas.CoronaDecorationPolicy({diameterToBeVisible:50});
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


        Mousetrap.bind(['left'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            _this.getSelection().each(function(i,f){f.translate(-diff,0);});
            return false;
        });
        Mousetrap.bind(['up'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            _this.getSelection().each(function(i,f){f.translate(0,-diff);});
            return false;
        });
        Mousetrap.bind(['right'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            _this.getSelection().each(function(i,f){f.translate(diff,0);});
            return false;
        });
        Mousetrap.bind(['down'],function (event) {
            var diff = _this.getZoom()<0.5?0.5:1;
            _this.getSelection().each(function(i,f){f.translate(0,diff);});
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

        $("#simulationStartStop").on("click", function(){
            _this.simulationToggle();
        });


        this.on("contextmenu", function(emitter, event){
            var figure = _this.getBestFigure(event.x, event.y);

            // a connectionprovides its own context menu
            //
            if(figure instanceof draw2d.Connection){
                return;
            }

            if(figure!==null){
                var x = event.x;
                var y = event.y;

                var pathToFile   = "https://github.com/freegroup/draw2d_js.shapes/blob/master/"+ eval(figure.NAME+".github");
                var pathToMD     = conf.shapes.url+figure.NAME+".md";
                var pathToCustom = conf.shapes.url+figure.NAME+".custom";
                var pathToDesign = conf.designer.url+"#file="+ figure.NAME+".shape";
                var items = {
                    "help":    {name: "Help"             , icon :"x ion-ios-information-outline"  },
                    "delete":  {name: "Delete"           , icon :"x ion-ios-close-outline"        },
                    "sep1":    "---------",
                    "code":    {name: "Show Code"        , icon :"x ion-social-javascript-outline"},
                    "design":  {name: "Open Designer"    , icon :"x ion-ios-compose-outline"      },
                    "bug":     {name: "Report Bug"       , icon :"x ion-social-github"            }
                };
                if(conf.designer.url===null){
                     items = {
                        "help":    {name: "Help"             , icon :"x ion-ios-information-outline"  },
                        "code":    {name: "Show Code"        , icon :"x ion-social-javascript-outline"},
                        "delete":  {name: "Delete"           , icon :"x ion-ios-close-outline"        }
                     };
                }

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
                    items:items

                });
            }
        });

        // hide the figure configuration dialog if the user clicks inside the canvas
        //
        this.on("click", function(){
            $("#figureConfigDialog").hide();
        });

        this.slider= $('#simulationBaseTimer')
            .slider({
                id:"simulationBaseTimerSlider"
            })
            .on("slide",function(event){
                // min = 50     => 100ms
                // norm= 100    => 10ms ticks
                // max = 500    =>  2ms ticks
                //
                // To map between the different intervals
                // [A, B] --> [a, b]
                // use this formula
                // (val - A)*(b-a)/(B-A) + a

                if(event.value<100){
                    _this.timerBase = parseInt(100-((event.value-50)*(100-10)/(100-50)+10));
                }
                else{
                    _this.timerBase = parseInt(11-((event.value-100)*(10-2)/(500-100)+2));
                }
            });

        // force focus for the searchbox in the object palette
        //
        setInterval(function(){
            // force only the focus if the editor tab pane is visible
            if(!$("#editor").hasClass("active")){
                return;
            }

            // fore only the focus if the "filter" input element the one and only visible
            // input field
            //
            if($("input:visible").length>1){
                return;
            }

            document.getElementById("filter").focus();
        },10);
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
     * Disable snapTo GRID if we have select more than one element
     * @param figure
     * @param pos
     */
    snapToHelper : function(figure, pos)
    {
        if(this.getSelection().getSize()>1){
            return pos;
        }
        return this._super(figure, pos);
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

    simulationToggle:function()
    {
        if(this.simulate===true){
            this.simulationStop();
            $("#favicon_sim").attr("href","./assets/images/favicon_edit.ico");
        } else {
            this.simulationStart();
            $("#favicon_sim").attr("href","./assets/images/favicon_sim.ico");
        }
    },

    simulationStart:function()
    {
        if(this.simulate===true){
            return; // silently
        }

        this.simulate=true;

        this.installEditPolicy(new SimulationEditPolicy());
        this.uninstallEditPolicy(this.connectionPolicy);
        this.uninstallEditPolicy(this.coronaFeedback);
        this.commonPorts.each(function(i,p){
            p.setVisible(false);
        });

        this._calculate();

        $("#simulationStartStop").addClass("pause");
        $("#simulationStartStop").removeClass("play");
        $(".simulationBase" ).fadeIn( "slow" );
        $("#paletteElementsOverlay" ).fadeIn( "fast" );
        $("#paletteElementsOverlay").height($("#paletteElements").height());
        this.slider.slider("setValue",100);

        this.probeWindow.show();
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

        $("#simulationStartStop").addClass("play");
        $("#simulationStartStop").removeClass("pause");
        $(".simulationBase" ).fadeOut( "slow" );
        $("#paletteElementsOverlay" ).fadeOut( "fast" );
        this.probeWindow.hide();
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
       //     setImmediate(this.animationFrameFunc);
            setTimeout(this.animationFrameFunc,this.timerBase);
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
        if(this.getFigures().getSize()>0){
            // get the bounding box of the document and translate the complete document
            // into the center of the canvas. Scroll to the top left corner after them
            //
            bb = this.getBoundingBox();

            /*
            var dx = (this.getWidth()/2)-(bb.x+bb.w/2);
            var dy = (this.getHeight()/2)-(bb.y+bb.h/2);


            this.getFigures().each(function(i,f){
                f.translate(dx,dy, true);
            });

            this.getLines().each(function(i,f){
                f.translate(dx,dy);
            });
            bb = this.getBoundingBox().getCenter();
*/

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
    }
});
