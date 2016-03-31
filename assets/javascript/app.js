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

        this.palette = new Palette(this);
        this.view    = new View(this, "draw2dCanvas");

    }
});

;
var conf ={
    repository:"http://freegroup.github.io/draw2d_js.shapes/assets/shapes/index.js"
};
;

var Gate_AND = draw2d.SVGFigure.extend({

    NAME : "Gate_AND",

    /**
     * @constructor
     * Creates a new figure element which is not assigned to any canvas.
     *
     * @param {Object} [attr] the configuration of the shape
     */
    init : function(attr, getter, setter)
    {
        this.svg =
        '<svg width="80px" height="60px" viewBox="10 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
//        '    <g stroke="#000000" stroke-width="2" fill="none">'+
        '     <path stroke="#000000" stroke-width="2" fill="none" d="M17,12.0045213 C17,9.24060052 19.2404764,7.00000002 21.9979755,7.00000001 C21.9979755,7.00000001 29.4752135,6.99999998 40.9506479,7.00000003 C46.9791846,7.00000006 64.0195312,11.6132813 64.0195312,29 C64.0195312,46.3867188 48.6227859,51 40.9506479,51 C24.7871138,51 21.9997664,51 21.9997664,51 C19.2384717,51 17,48.7575422 17,45.9954788 L17,12.0045213 Z" id="Rectangle-28"></path>'+
        '     <path stroke="#000000" stroke-width="2" fill="none" d="M16.5,16 L6.5,16" id="Line" stroke-linecap="round"></path>'+
        '     <path stroke="#000000" stroke-width="2" fill="none" d="M74.5,29 L64.5,29" id="Line" stroke-linecap="round"></path>'+
        '     <path stroke="#000000" stroke-width="2" fill="none" d="M16.5,41 L6.5,41" id="Line" stroke-linecap="round"></path>'+
//        '    </g>'+
        '</svg>';


        this._super($.extend({svg: this.svg, resizeable:false},attr), getter, setter);


        this.createPort("input");
        this.createPort("input");
        this.createPort("output");

    },


    applyTransformation: function()
    {
        var trans = [];


        if(this.rotationAngle!==0){
            trans.push("R"+this.rotationAngle);
        }

        if(this.getRotationAngle()=== 90|| this.getRotationAngle()===270){
            var ratio = this.getHeight()/this.getWidth();
            trans.push("T"+(-this.offsetY) + "," + (-this.offsetX));
            trans.push("S"+ratio+","+1/ratio+",0,0");
        }
        else{
            trans.push("T"+(-this.offsetX) + "," + (-this.offsetY));

        }
        if (this.isResizeable()===true) {
            trans.push(
                "T"+ this.getAbsoluteX() + "," + this.getAbsoluteY()+
                "S"+this.scaleX+","+this.scaleY+","+this.getAbsoluteX()+","+this.getAbsoluteY()
            );
        }
        else {
            trans.push("T" + this.getAbsoluteX() + "," + this.getAbsoluteY());
        }

        this.svgNodes.transform(trans.join(" "));
    },

    /**
     * @private
     */
    createShapeElement: function()
    {
        var shape = this._super();

        var bb = this.svgNodes.getBBox();

        this.offsetX = bb.x;
        this.offsetY = bb.y;
        this.width = bb.width;
        this.height = bb.height;
        this.svgNodes.items[0].shadow();
        return shape;
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
            $('#filter').on('keyup change', function () {
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

        });

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


var View = draw2d.Canvas.extend({

    init:function(app, id)
    {
        var _this = this;

        this._super(id, 2000,2000);

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
    }
});
