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
            var compiled = Handlebars.compile(
                '                       '+
                '  {{#each settings}}               '+
                '      {{#ifCond property.type "===" "blocid"}}      '+
                '         <div class="form-group">'+
                '           <label for="figure_property_{{name}}">{{label}}</label>'+
                '           <select class="form-control" id="figure_property_{{name}}" data-name="{{name}}" size="4"> '+
                '               <option value="not-selected">- not bounded -</option>   '+
                '               {{#each ../blocs_push}}               '+
                '               <option data-name="{{name}}" value="{{blocId}}">Push {{blocNr}}</option>   '+
                '               {{/each}}               '+
                '           </select>   '+
                '         </div>                  '+
                      '{{else}}                   '+
                '         <div class="form-group">'+
                '           <label for="figure_property_{{name}}">{{label}}</label>'+
                '           <input type="text" class="form-control" id="figure_property_{{name}}" data-name="{{name}}" value="{{value}}" placeholder="{{label}}">'+
                '         </div>                  '+
                    '{{/ifCond}}                  '+
                '  {{/each}}                  '+
                '<button class="submit">Ok</button> '
            );
            var output = compiled({
                settings: settings,
                blocs_push : hardware.bloc.connected().filter(function(val){return val.blocType==="Push";})
            });

            $("#figureConfigDialog").html(output);
            $("#figureConfigDialog").show().css({top: pos.y, left: pos.x, position:'absolute'});
            $("#figureConfigDialog input").focus();

            $("#figureConfigDialog input").keypress(function(e) {
                if(e.which == 13) {
                    FigureConfigDialog.hide();
                }
            });
            $("#figureConfigDialog .submit").on("click",function(){FigureConfigDialog.hide();});

            $.each(settings,function(index, setting){
                var figureValue = currentFigure.attr("userData." + setting.name);
                $('#figureConfigDialog select[data-name="'+setting.name+'"] option[value="'+figureValue+'"]').attr('selected','selected');

            });
        },

        hide: function()
        {
            if(currentFigure!==null) {
                $("#figureConfigDialog input, #figureConfigDialog select").each(function (i, element) {
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
