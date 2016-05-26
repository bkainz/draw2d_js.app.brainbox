var ProbeWindow = Class.extend({

    init:function()
    {

    },

    show:function()
    {
        $("#probe_window").show().animate({height:'200px'},300);
        $("#draw2dCanvasWrapper").animate({bottom:'200px'},300);
    },

    hide:function()
    {
        $("#probe_window").animate({height:'0'},300);
        $("#draw2dCanvasWrapper").animate({bottom:'0'},300);
    }
});
