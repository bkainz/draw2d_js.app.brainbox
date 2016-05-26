
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

    /**
     * Return the ProbeFigure if the connection has any or NULL
     *
     * @return {ProbeFigure}
     */
    getProbeFigure:function()
    {
        var entry= this.children.find(function(entry){
               return entry.figure instanceof ProbeFigure;
             });
        return (entry!==null)?entry.figure:null;
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
