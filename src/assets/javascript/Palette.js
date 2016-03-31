/*jshint sub:true*/


/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 */

var Palette = Class.extend(
{

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function(app)
    {
        var _this = this;

        var $grid = $("#paletteElements");

        $.getJSON("http://freegroup.github.io/draw2d_js.shapes/assets/shapes/index.json", function(data) {

            data.forEach(function (element){
                element.basename = element.name.split("_").pop();
            });
            var tmpl = $.templates("#shapeTemplate");
            var html = tmpl.render({shapes: data});

            $("#paletteElements").html(html);

            // Advanced filtering
            $('#filter').on('keyup change', function () {
                var val = this.value.toLowerCase();
                $grid.shuffle('shuffle', function ($el, shuffle) {
                    var text = $.trim($el.data("name")).toLowerCase();
                    return text.indexOf(val) !== -1;
                });
            });


            // Create the jQuery-Draggable for the palette -> canvas drag&drop interaction
            //
            $(".draw2d_droppable").draggable({
                appendTo:"body",
                stack:"body",
                zIndex: 27000,
                helper:"clone",
                drag: function(event, ui){
                    event = app.view._getEvent(event);
                    var pos = app.view.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    app.view.onDrag(ui.draggable, pos.getX(), pos.getY(), event.shiftKey, event.ctrlKey);
                },
                stop: function(e, ui){
                },
                start: function(e, ui){
                    $(ui.helper).addClass("shadow");
                }
            });

        });

    }
});
