

var Reader = draw2d.io.json.Reader.extend({

    init:function(){
        this._super();
    },

    createFigureFromType:function(type)
    {
        // path object types from older versions of JSON
        if(type === "draw2d.Connection"){
            type ="Connection";
        }

        return this._super(type);
    }
});