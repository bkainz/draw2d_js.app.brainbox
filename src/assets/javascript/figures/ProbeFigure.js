var ProbeFigure = draw2d.shape.basic.Label.extend({

    NAME : "ProbeFigure",

    /**
     * @param attr
     */
    init : function(attr, setter, getter)
    {
        this._super($.extend({
                padding:{left:5, top:2, bottom:2, right:10},
                bgColor:"#FFFFFF",
                stroke:0,
                color:"#000000",
                fontSize:8
            },attr),
            setter,
            getter);
    }

});
