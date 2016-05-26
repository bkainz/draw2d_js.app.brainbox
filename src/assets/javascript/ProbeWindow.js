var ProbeWindow = Class.extend({

    init:function(canvas)
    {
        this.canvas = canvas;
    },

    show:function()
    {
        var probes = [];
        // get all probes from the canvas and add them to the window
        //
        this.canvas.getLines().each(function(i,line){
            var probe = line.getProbeFigure();
            console.log(probe);
            if(probe!==null){
                probes.push(probe);
            }
        });

        //
        $("#probe_window").html('<ul id="probeSortable"></ul>');

        var ul = $("#probeSortable");
        probes.forEach(function(e,index){
            ul.append('<li class="ui-state-default"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item 1</li>');
        });

        $("#probe_window").show().animate({height:'200px'},300);
        $("#draw2dCanvasWrapper").animate({bottom:'200px'},300);
    },

    hide:function()
    {
        $("#probe_window").animate({height:'0'},300);
        $("#draw2dCanvasWrapper").animate({bottom:'0'},300);
    }
});
