var ddd= "test";;
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



