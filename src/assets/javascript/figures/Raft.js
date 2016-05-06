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
