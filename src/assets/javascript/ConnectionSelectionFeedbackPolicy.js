ConnectionSelectionFeedbackPolicy = draw2d.policy.line.OrthogonalSelectionFeedbackPolicy.extend({

    NAME: "ConnectionSelectionFeedbackPolicy",

    /**
     * @constructor
     * Creates a new Router object.
     *
     */
    init: function ()
    {
        this._super();
    },


    onRightMouseDown: function(conn, x, y, shiftKey, ctrlKey)
    {
        var segment = conn.hitSegment(x,y);

        if(segment===null){
            return;
        }

        // standard menu entry "split". It is always possible to split a connection
        //
        var items = {
            "split":  {name: draw2d.Configuration.i18n.menu.addSegment}
        };

        // "remove" a segment isn't always possible. depends from the router algorithm
        //
        if(conn.getRouter().canRemoveSegmentAt(conn, segment.index)){
            items.remove= {name: draw2d.Configuration.i18n.menu.deleteSegment};
        }

        // add a probe label is always possible
        //
        items.probe= {name: "Probe"};

        $.contextMenu({
            selector: 'body',
            events:
            {
                hide: function(){ $.contextMenu( 'destroy' ); }
            },
            callback: $.proxy(function(key, options)
            {
                var originalVertices, newVertices ;

                switch(key){
                    case "remove":
                        // deep copy of the vertices of the connection for the command stack to avoid side effects
                        originalVertices = conn.getVertices().clone(true);
                        this.removeSegment(conn, segment.index);
                        newVertices = conn.getVertices().clone(true);
                        conn.getCanvas().getCommandStack().execute(new draw2d.command.CommandReplaceVertices(conn, originalVertices, newVertices));
                        break;

                    case "split":
                        // deep copy of the vertices of the connection for the command stack to avoid side effects
                        originalVertices = conn.getVertices().clone(true);
                        this.splitSegment(conn, segment.index, x, y);
                        newVertices = conn.getVertices().clone(true);
                        conn.getCanvas().getCommandStack().execute(new draw2d.command.CommandReplaceVertices(conn, originalVertices, newVertices));
                        break;

                    case "probe":
                        var label = new ProbeFigure({text:"Probe signal", stroke:0, x:-20, y:-40});
                        var locator = new draw2d.layout.locator.ManhattanMidpointLocator();
                        label.installEditor(new draw2d.ui.LabelInplaceEditor());
                        conn.add(label,locator);
                        break;
                    default:
                        break;
                }
            },this),
            x:x,
            y:y,
            items: items
        });
    }
});

