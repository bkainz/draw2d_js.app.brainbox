/*jshint evil:true */

var Connection = draw2d.Connection.extend({

    NAME: "Connection",

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

    getValue:function()
    {
        return this.getSource().getValue();
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
    },

    add: function(figure)
    {
        this._super.apply(this,arguments);

        if(figure instanceof ProbeFigure && this.canvas !==null){
            this.canvas.fireEvent("probe:add", {figure:figure});
        }
    },


    remove: function(figure)
    {
        this._super.apply(this,arguments);

        if(figure instanceof ProbeFigure && this.canvas !==null){
            this.canvas.fireEvent("probe:remove", {figure:figure});
        }
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
        // patch the router from some legacy data
        //
        memento.router ="ConnectionRouter";

        this._super(memento);

        // remove all decorations created in the constructor of this element
        //
        this.resetChildren();

        // and add all children of the JSON document.
        //
        if(memento.labels) {
            $.each(memento.labels, $.proxy(function (i, json) {
                // create the figure stored in the JSON
                var figure = eval("new " + json.type + "()");

                // apply all attributes
                figure.setPersistentAttributes(json);

                // instantiate the locator
                var locator = eval("new " + json.locator + "()");

                // add the new figure as child to this figure
                this.add(figure, locator);
            }, this));
        }
    }

});
