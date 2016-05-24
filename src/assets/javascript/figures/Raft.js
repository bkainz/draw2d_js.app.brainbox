/*jshint evil:true */


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
    },

    setPosition: function(x, y, shiftKey, ctrlKey)
    {
        // the children didn't move away if you press the SHIFT key.
        //
        this._super(x,y, shiftKey);
    },


    onDrag: function( dx,  dy, dx2, dy2, shiftKey, ctrlKey)
    {
        var _this = this;

        // apply all EditPolicy for DragDrop Operations
        //
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                var newPos = e.adjustPosition(_this,_this.ox+dx,_this.oy+dy);
                if(newPos) {
                    dx = newPos.x - _this.ox;
                    dy = newPos.y - _this.oy;
                }
            }
        });

        var newPos = new draw2d.geo.Point(this.ox+dx, this.oy+dy);

        // Adjust the new location if the object can snap to a helper
        // like grid, geometry, ruler,...
        //
        if(this.getCanSnapToHelper()){
            newPos = this.getCanvas().snapToHelper(this, newPos);
        }


        // push the shiftKey to the setPosition method
        this.setPosition(newPos.x, newPos.y, shiftKey, ctrlKey);

        // notify all installed policies
        //
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                e.onDrag(_this.canvas, _this);
            }
        });


        // fire an event
        // @since 5.3.3
        this.fireEvent("drag",{dx:dx, dy:dy, dx2:dx2, dy2:dy2, shiftKey:shiftKey, ctrlKey:ctrlKey});
    },

    /**
     * @method
     * Return an objects with all important attributes for XML or JSON serialization
     *
     * @returns {Object}
     */
    getPersistentAttributes : function()
    {
        var memento = this._super();

        // add all decorations to the memento
        //
        memento.labels = [];
        this.children.each(function(i,e){
            var labelJSON = e.figure.getPersistentAttributes();
            labelJSON.locator=e.locator.NAME;
            memento.labels.push(labelJSON);
        });

        return memento;
    },

    /**
     * @method
     * Read all attributes from the serialized properties and transfer them into the shape.
     *
     * @param {Object} memento
     * @returns
     */
    setPersistentAttributes : function(memento)
    {
        this._super(memento);

        // remove all decorations created in the constructor of this element
        //
        this.resetChildren();

        // and add all children of the JSON document.
        //
        $.each(memento.labels, $.proxy(function(i,json){
            // create the figure stored in the JSON
            var figure =  eval("new "+json.type+"()");

            // apply all attributes
            figure.attr(json);

            // instantiate the locator
            var locator =  eval("new "+json.locator+"()");

            // add the new figure as child to this figure
            this.add(figure, locator);
        },this));
    }

});
