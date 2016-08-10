var FigureConfigDialog = (function () {

    //"private" variables
    var currentFigure =null;


    //"public" stuff
    return {
        show: function(figure, pos)
        {
            currentFigure=figure;

            var settings = figure.getParameterSettings().slice(0);
            $.each(settings,function(i,el){
                el.value = currentFigure.attr("userData."+el.name);
            });
            var compiled = Hogan.compile(
                '                       '+
                '  {{#settings}}               '+
                '      <div class="form-group">'+
                '           <label for="figure_property_{{name}}">{{label}}</label>'+
                '           <input type="text" class="form-control" id="figure_property_{{name}}" data-name="{{name}}" value="{{value}}" placeholder="{{label}}">'+
                '      </div>                  '+
                '  {{/settings}}               '+
                ''
            );
            var output = compiled.render({
                settings: settings
            });

            $("#figureConfigDialog").html(output);
            $("#figureConfigDialog").show().css({top: pos.y, left: pos.x, position:'absolute'});
            $("#figureConfigDialog input").focus();

            $("#figureConfigDialog input").keypress(function(e) {
                if(e.which == 13) {
                    FigureConfigDialog.hide();
                }
            });
        },

        hide: function()
        {
            if(currentFigure!==null) {
                $("#figureConfigDialog input").each(function (i, element) {
                    element = $(element);
                    var value = element.val();
                    var name = element.data("name");

                    currentFigure.attr("userData." + name, value);
                    console.log(name, value);
                });
                console.log(currentFigure);
            }
            $("#figureConfigDialog").hide();

            currentFigure=null;
        }
    };
})();
